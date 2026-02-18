"""
Smart Scheduler - Planification intelligente pour le scraping
Optimise les horaires de collecte selon:
- Popularité de la source
- Patterns temporels
- Priorité des marques
- Contraintes de rate limiting
"""
import asyncio
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
import redis.asyncio as redis
from loguru import logger
import heapq

class Priority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4

class SourceStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RATE_LIMITED = "rate_limited"

@dataclass
class ScrapingTask:
    """Tâche de scraping planifiée"""
    id: str
    source_id: str
    brand_id: str
    url: str
    source_type: str
    priority: Priority
    created_at: float
    scheduled_at: float
    last_run: Optional[float] = None
    last_status: Optional[SourceStatus] = None
    last_error: Optional[str] = None
    run_count: int = 0
    success_count: int = 0
    failure_count: int = 0
    avg_duration: float = 0.0
    
    def __lt__(self, other):
        # Pour le heap: priorité plus haute = plus petit (exécuté en premier)
        if self.priority != other.priority:
            return self.priority.value > other.priority.value
        return self.scheduled_at < other.scheduled_at

@dataclass
class SourceConfig:
    """Configuration d'une source pour le scheduler"""
    source_id: str
    brand_id: str
    url: str
    source_type: str
    base_frequency: int = 3600  # secondes
    min_frequency: int = 300    # 5 minutes minimum
    max_frequency: int = 86400  # 24h maximum
    priority: Priority = Priority.NORMAL
    enabled: bool = True
    country: Optional[str] = None
    keywords: list[str] = field(default_factory=list)

class SmartScheduler:
    """
    Scheduler intelligent avec:
    - Priority queue basée sur plusieurs facteurs
    - Rate limiting intelligent
    - Adaptation dynamique des fréquences
    - Retry automatique intelligent
    - Distribution horizontale (via Redis)
    """
    
    def __init__(
        self,
        redis_url: str = "redis://localhost:6379",
        max_concurrent: int = 10,
        check_interval: int = 30
    ):
        self.redis_url = redis_url
        self.max_concurrent = max_concurrent
        self.check_interval = check_interval
        
        # Files d'attente
        self.pending_queue: list[ScrapingTask] = []
        self.running_tasks: dict[str, ScrapingTask] = {}
        self.failed_queue: list[ScrapingTask] = []
        
        # Source configurations
        self.source_configs: dict[str, SourceConfig] = {}
        
        # Métriques
        self.metrics = {
            "total_tasks": 0,
            "completed_tasks": 0,
            "failed_tasks": 0,
            "avg_execution_time": 0.0
        }
        
        # Contrôle
        self.is_running = False
        self._task_callback: Optional[callable] = None
        
        logger.info("SmartScheduler initialisé")
    
    async def start(self, task_callback: callable) -> None:
        """Démarre le scheduler"""
        self._task_callback = task_callback
        self.is_running = True
        
        # Tâche principale
        asyncio.create_task(self._scheduler_loop())
        
        logger.info("SmartScheduler démarré")
    
    async def stop(self) -> None:
        """Arrête le scheduler"""
        self.is_running = False
        logger.info("SmartScheduler arrêté")
    
    async def add_source(self, config: SourceConfig) -> None:
        """Ajoute ou met à jour une source"""
        self.source_configs[config.source_id] = config
        
        # Créer une tâche initiale
        task = ScrapingTask(
            id=f"task_{config.source_id}_{int(time.time())}",
            source_id=config.source_id,
            brand_id=config.brand_id,
            url=config.url,
            source_type=config.source_type,
            priority=config.priority,
            created_at=time.time(),
            scheduled_at=time.time()  # Exécuter ASAP
        )
        
        heapq.heappush(self.pending_queue, task)
        self.metrics["total_tasks"] += 1
        
        logger.info(f"Source ajoutée: {config.source_id} (priority: {config.priority.name})")
    
    async def remove_source(self, source_id: str) -> None:
        """Supprime une source"""
        if source_id in self.source_configs:
            del self.source_configs[source_id]
            
            # Retirer de la queue si présent
            self.pending_queue = [
                t for t in self.pending_queue
                if t.source_id != source_id
            ]
            
            logger.info(f"Source supprimée: {source_id}")
    
    async def update_frequency(self, source_id: str, success: bool, duration: float) -> None:
        """
        Met à jour dynamiquement la fréquence basée sur les performances
        
        - Success + rapide = fréquence augmentée (moins urgent)
        - Échec = fréquence diminuée (plus de retry)
        - Rate limit = fréquence augmenté (éviter le blocage)
        """
        if source_id not in self.source_configs:
            return
        
        config = self.source_configs[source_id]
        
        # Trouver la tâche correspondante
        task = next((t for t in self.pending_queue if t.source_id == source_id), None)
        if not task:
            return
        
        # Mise à jour des statistiques
        task.run_count += 1
        task.last_run = time.time()
        
        if success:
            task.success_count += 1
            
            # Moyenne mobile du temps d'exécution
            if task.avg_duration == 0:
                task.avg_duration = duration
            else:
                task.avg_duration = 0.7 * task.avg_duration + 0.3 * duration
            
            # Ajuster la fréquence
            # Si c'est rapide, on peut augmenter l'intervalle
            if duration < 10 and config.base_frequency < config.max_frequency:
                new_frequency = int(config.base_frequency * 1.2)
                config.base_frequency = min(new_frequency, config.max_frequency)
        else:
            task.failure_count += 1
            
            # Réduire la fréquence en cas d'échec
            if config.base_frequency > config.min_frequency:
                new_frequency = int(config.base_frequency * 0.7)
                config.base_frequency = max(new_frequency, config.min_frequency)
        
        # Planifier le prochain run
        task.scheduled_at = time.time() + config.base_frequency
        
        # Remettre dans la queue
        heapq.heappush(self.pending_queue, task)
    
    async def _scheduler_loop(self) -> None:
        """Boucle principale du scheduler"""
        while self.is_running:
            try:
                # Nettoyer les tâches expirées
                self._cleanup_completed_tasks()
                
                # Exécuter les tâches prêtes
                await self._process_ready_tasks()
                
                # Réessayer les tâches échouées
                await self._retry_failed_tasks()
                
            except Exception as e:
                logger.error(f"Erreur dans la boucle du scheduler: {e}")
            
            await asyncio.sleep(self.check_interval)
    
    def _cleanup_completed_tasks(self) -> None:
        """Nettoie les tâches terminées"""
        now = time.time()
        
        # Retirer les tâches terminées depuis plus de 5 minutes
        self.running_tasks = {
            task_id: task
            for task_id, task in self.running_tasks.items()
            if task.last_status != SourceStatus.COMPLETED or 
            (task.last_run and now - task.last_run < 300)
        }
    
    async def _process_ready_tasks(self) -> None:
        """Traite les tâches prêtes à exécuter"""
        now = time.time()
        
        # Limiter les tâches concurrentes
        if len(self.running_tasks) >= self.max_concurrent:
            return
        
        tasks_to_run = []
        
        while self.pending_queue and len(tasks_to_run) + len(self.running_tasks) < self.max_concurrent:
            task = heapq.heappop(self.pending_queue)
            
            if task.scheduled_at <= now:
                tasks_to_run.append(task)
            else:
                # Remettre dans la queue si pas encore l'heure
                heapq.heappush(self.pending_queue, task)
                break
        
        # Exécuter les tâches
        for task in tasks_to_run:
            task.last_status = SourceStatus.RUNNING
            self.running_tasks[task.id] = task
            
            # Exécuter la tâche
            asyncio.create_task(self._execute_task(task))
    
    async def _execute_task(self, task: ScrapingTask) -> None:
        """Exécute une tâche de scraping"""
        logger.info(f"Exécution tâche: {task.id} ({task.source_type})")
        
        start_time = time.time()
        
        try:
            if self._task_callback:
                result = await self._task_callback(task)
                
                duration = time.time() - start_time
                
                # Mettre à jour le statut
                if result.get("success"):
                    task.last_status = SourceStatus.COMPLETED
                    task.last_error = None
                    await self.update_frequency(task.source_id, True, duration)
                    self.metrics["completed_tasks"] += 1
                else:
                    task.last_status = SourceStatus.FAILED
                    task.last_error = result.get("error", "Unknown error")
                    await self.update_frequency(task.source_id, False, duration)
                    heapq.heappush(self.failed_queue, task)
                    self.metrics["failed_tasks"] += 1
                    
        except Exception as e:
            logger.error(f"Erreur exécution {task.id}: {e}")
            task.last_status = SourceStatus.FAILED
            task.last_error = str(e)
            await self.update_frequency(task.source_id, False, time.time() - start_time)
            heapq.heappush(self.failed_queue, task)
            self.metrics["failed_tasks"] += 1
        
        finally:
            # Retirer des tâches en cours
            if task.id in self.running_tasks:
                del self.running_tasks[task.id]
    
    async def _retry_failed_tasks(self) -> None:
        """Retente les tâches échouées avec backoff"""
        if not self.failed_queue:
            return
        
        # Limiter les retries
        max_retries = 3
        
        tasks_to_retry = []
        while self.failed_queue and len(tasks_to_retry) < 5:
            task = heapq.heappop(self.failed_queue)
            
            if task.failure_count < max_retries:
                # Backoff exponentiel
                delay = min(300, 30 * (2 ** task.failure_count))
                task.scheduled_at = time.time() + delay
                heapq.heappush(self.pending_queue, task)
                logger.info(f"Retry planifié pour {task.id} dans {delay}s")
            else:
                logger.warning(f"Tâche abandonnée après {max_retries} échecs: {task.id}")
    
    def get_stats(self) -> dict:
        """Retourne les statistiques du scheduler"""
        return {
            **self.metrics,
            "pending_tasks": len(self.pending_queue),
            "running_tasks": len(self.running_tasks),
            "failed_queue": len(self.failed_queue),
            "registered_sources": len(self.source_configs)
        }
    
    def get_next_tasks(self, count: int = 10) -> list[ScrapingTask]:
        """Retourne les prochaines tâches à exécuter"""
        # Trier par priorité et date
        sorted_tasks = sorted(
            [t for t in self.pending_queue if t.scheduled_at <= time.time()],
            key=lambda t: (t.priority.value, t.scheduled_at),
            reverse=True
        )
        return sorted_tasks[:count]


# Classe pour la persistance Redis (optionnelle)
class SchedulerPersistence:
    """Persistance du scheduler via Redis pour distribution horizontale"""
    
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.redis: Optional[redis.Redis] = None
    
    async def connect(self):
        self.redis = redis.from_url(self.redis_url)
    
    async def save_state(self, scheduler: SmartScheduler):
        """Sauvegarde l'état dans Redis"""
        if not self.redis:
            return
        
        import json
        
        # Sauvegarder les tâches en attente
        tasks_data = [
            {
                "id": t.id,
                "source_id": t.source_id,
                "url": t.url,
                "priority": t.priority.value,
                "scheduled_at": t.scheduled_at
            }
            for t in scheduler.pending_queue
        ]
        
        await self.redis.set(
            "scraper:pending_tasks",
            json.dumps(tasks_data),
            ex=3600
        )
    
    async def load_state(self) -> list[dict]:
        """Charge l'état depuis Redis"""
        if not self.redis:
            return []
        
        data = await self.redis.get("scraper:pending_tasks")
        if data:
            import json
            return json.loads(data)
        return []
