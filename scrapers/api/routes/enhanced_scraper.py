"""
Enhanced Scraper API Routes
===========================
Nouveaux endpoints pour le scraping avancé avec:
- Playwright + Anti-détection
- Proxy rotation
- Rate limiting intelligent
- Smart scheduling
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import asyncio
from loguru import logger

# Import des nouveaux modules
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from scraping_core import (
    PlaywrightEngine,
    ProxyManager,
    AntiDetectionSystem,
    SmartScheduler,
    BrowserConfig,
    SourceConfig,
    Priority
)
from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any, Optional
import asyncio

# ==================== Enums et Configurations manquantes ====================

class ScrapingMethod(str, Enum):
    PLAYWRIGHT = "playwright"
    CHEERIO = "cheerio"
    API = "api"

@dataclass
class ScrapingResult:
    success: bool
    method_used: str
    proxy_used: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    detection_result: Optional[Any] = None
    execution_time: float = 0.0

@dataclass
class EngineConfig:
    method: ScrapingMethod = ScrapingMethod.PLAYWRIGHT
    use_proxy: bool = True
    use_stealth: bool = True
    headless: bool = True
    timeout: int = 30000

# ==================== Engine simple ====================

class SimpleScrapingEngine:
    """Engine de scraping simplifié utilisant PlaywrightEngine"""
    
    def __init__(self):
        self.config = EngineConfig()
        self.proxy_manager = None
        self.anti_detection = AntiDetectionSystem()
        self.playwright = None
        self.scheduler = None
    
    async def scrape(self, url: str, selectors: Dict[str, str], source_type: str = "generic", country: str = None) -> ScrapingResult:
        """Effectue le scraping d'une URL"""
        import time
        start_time = time.time()
        
        try:
            # Initialiser Playwright si nécessaire
            if not self.playwright:
                from playwright.async_api import async_playwright
                self.playwright = await async_playwright().start()
            
            # Créer la config du navigateur
            locale = "fr-FR"
            timezone = "Europe/Paris"
            if country:
                # Mapper le pays vers locale
                country_map = {
                    "US": ("en-US", "America/New_York"),
                    "GB": ("en-GB", "Europe/London"),
                    "DE": ("de-DE", "Europe/Berlin"),
                    "ES": ("es-ES", "Europe/Madrid"),
                    "IT": ("it-IT", "Europe/Rome"),
                }
                if country in country_map:
                    locale, timezone = country_map[country]
            
            browser_config = BrowserConfig(
                headless=self.config.headless,
                stealth=self.config.use_stealth,
                locale=locale,
                timezone=timezone
            )
            
            # Créer l'instance PlaywrightEngine
            engine = PlaywrightEngine(
                proxy_manager=self.proxy_manager,
                config=browser_config
            )
            
            # Démarrer le navigateur
            await engine.start()
            
            # Effectuer le scraping
            scraped_item = await engine.scrape(url, selectors)
            
            # Arrêter le navigateur
            await engine.stop()
            
            return ScrapingResult(
                success=True,
                method_used=self.config.method.value,
                data=scraped_item.__dict__ if scraped_item else None,
                execution_time=time.time() - start_time
            )
            
        except Exception as e:
            return ScrapingResult(
                success=False,
                method_used=self.config.method.value,
                error=str(e),
                execution_time=time.time() - start_time
            )
    
    def get_stats(self) -> Dict[str, Any]:
        """Retourne les statistiques"""
        return {
            "status": "running",
            "method": self.config.method.value
        }

# Instance globale de l'engine
_engine_instance = None
_engine_lock = asyncio.Lock()

async def get_engine() -> SimpleScrapingEngine:
    """Retourne l'instance singleton du moteur de scraping"""
    global _engine_instance
    if _engine_instance is None:
        async with _engine_lock:
            if _engine_instance is None:
                _engine_instance = SimpleScrapingEngine()
    return _engine_instance

router = APIRouter(prefix="/enhanced", tags=["Enhanced Scraping"])

# ==================== Schemas ====================

class ScrapingRequest(BaseModel):
    """Requête de scraping"""
    url: str = Field(..., description="URL à scraper")
    selectors: Dict[str, str] = Field(..., description="Sélecteurs CSS pour l'extraction")
    method: str = Field(default="playwright", description="Méthode: cheerio, playwright, api")
    use_proxy: bool = Field(default=True, description="Utiliser la rotation de proxies")
    use_stealth: bool = Field(default=True, description="Mode stealth (anti-détection)")
    headless: bool = Field(default=True, description="Navigateur headless")
    country: Optional[str] = Field(default=None, description="Pays du proxy")
    timeout: int = Field(default=30000, description="Timeout en ms")

class SourceScrapingRequest(BaseModel):
    """Requête de scraping d'une source configurée"""
    source_id: str
    source_type: str
    url: str
    selectors: Dict[str, str]
    priority: str = Field(default="normal", description="low, normal, high, critical")
    frequency: int = Field(default=3600, description="Fréquence en secondes")
    country: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)

class ScrapingResponse(BaseModel):
    """Réponse de scraping"""
    success: bool
    url: str
    method_used: str
    proxy_used: Optional[str]
    data: Optional[Dict]
    error: Optional[str]
    blockage_detected: Optional[str]
    execution_time: float
    
class HealthCheckResponse(BaseModel):
    """Réponse du health check"""
    status: str
    proxies_healthy: int
    proxies_total: int
    browsers_available: int
    scheduler_stats: Dict

# ==================== Endpoints ====================

@router.post("/scrape", response_model=ScrapingResponse)
async def scrape_url(request: ScrapingRequest):
    """
    Scrape une URL avec le moteur unifié
    
    Utilise Playwright avec anti-détection par défaut,
    peut basculer sur Cheerio en fallback
    """
    try:
        # Obtenir le moteur
        engine = await get_engine()
        
        # Mapper la méthode
        method_map = {
            "playwright": ScrapingMethod.PLAYWRIGHT,
            "cheerio": ScrapingMethod.CHEERIO,
            "api": ScrapingMethod.API
        }
        method = method_map.get(request.method, ScrapingMethod.PLAYWRIGHT)
        
        # Mettre à jour la config
        engine.config.method = method
        engine.config.use_proxy = request.use_proxy
        engine.config.use_stealth = request.use_stealth
        engine.config.headless = request.headless
        engine.config.timeout = request.timeout
        
        logger.info(f"Scraping: {request.url} avec {method.value}")
        
        # Exécuter le scraping
        result = await engine.scrape(
            url=request.url,
            selectors=request.selectors,
            source_type="generic",
            country=request.country
        )
        
        return ScrapingResponse(
            success=result.success,
            url=request.url,
            method_used=result.method_used,
            proxy_used=result.proxy_used,
            data=result.data if result.data else None,
            error=result.error,
            blockage_detected=result.detection_result.blockage_type if result.detection_result else None,
            execution_time=result.execution_time
        )
        
    except Exception as e:
        logger.error(f"Erreur scraping: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/source")
async def add_source_to_scheduler(request: SourceScrapingRequest):
    """
    Ajoute une source au scheduler intelligent
    
    Le scheduler gérera automatiquement:
    - La fréquence de scraping
    - Les retries en cas d'échec
    - L'optimisation des performances
    """
    try:
        engine = await get_engine()
        
        # Créer la config de la source
        priority_map = {
            "low": Priority.LOW,
            "normal": Priority.NORMAL,
            "high": Priority.HIGH,
            "critical": Priority.CRITICAL
        }
        
        source_config = SourceConfig(
            source_id=request.source_id,
            brand_id="default",  # À récupérer depuis la DB
            url=request.url,
            source_type=request.source_type,
            base_frequency=request.frequency,
            priority=priority_map.get(request.priority, Priority.NORMAL),
            country=request.country,
            keywords=request.keywords
        )
        
        # Ajouter au scheduler
        await engine.scheduler.add_source(source_config)
        
        return {
            "success": True,
            "message": f"Source {request.source_id} ajoutée au scheduler",
            "config": {
                "priority": source_config.priority.name,
                "frequency": source_config.base_frequency
            }
        }
        
    except Exception as e:
        logger.error(f"Erreur ajout source: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sources/pending")
async def get_pending_sources():
    """Retourne les sources en attente de scraping"""
    engine = await get_engine()
    
    if not engine.scheduler:
        return {"pending": [], "message": "Scheduler non initialisé"}
    
    next_tasks = engine.scheduler.get_next_tasks(count=20)
    
    return {
        "pending": [
            {
                "source_id": t.source_id,
                "url": t.url,
                "priority": t.priority.name,
                "scheduled_at": t.scheduled_at
            }
            for t in next_tasks
        ],
        "stats": engine.scheduler.get_stats()
    }


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check du système de scraping"""
    try:
        engine = await get_engine()
        
        # Vérifier les proxies
        proxy_stats = {}
        if engine.proxy_manager:
            proxy_stats = engine.proxy_manager.get_stats()
        
        # Vérifier les navigateurs
        browsers_available = len(engine.playwright_pool)
        
        # Vérifier le scheduler
        scheduler_stats = {}
        if engine.scheduler:
            scheduler_stats = engine.scheduler.get_stats()
        
        return HealthCheckResponse(
            status="healthy",
            proxies_healthy=proxy_stats.get("active_proxies", 0),
            proxies_total=proxy_stats.get("active_proxies", 0),
            browsers_available=browsers_available,
            scheduler_stats=scheduler_stats
        )
        
    except Exception as e:
        return HealthCheckResponse(
            status="unhealthy",
            proxies_healthy=0,
            proxies_total=0,
            browsers_available=0,
            scheduler_stats={"error": str(e)}
        )


@router.get("/stats")
async def get_stats():
    """Retourne les statistiques complètes"""
    engine = await get_engine()
    return engine.get_stats()


@router.post("/proxy/test")
async def test_proxy():
    """Teste tous les proxies disponibles"""
    engine = await get_engine()
    
    if not engine.proxy_manager:
        return {"error": "Proxy manager non configuré"}
    
    results = await engine.proxy_manager.health_check_all()
    
    return {
        "healthy": results["healthy"],
        "unhealthy": results["unhealthy"],
        "total": results["total"]
    }


@router.post("/shutdown")
async def shutdown_engine():
    """Arrête le moteur de scraping (pour maintenance)"""
    try:
        engine = await get_engine()
        await engine.shutdown()
        
        global _engine
        _engine = None
        
        return {"success": True, "message": "Moteur arrêté"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
