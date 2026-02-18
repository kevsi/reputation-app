"""
Proxy Manager - Gestion intelligente de la rotation de proxies
Supporte plusieurs providers: Bright Data, ScraperAPI, SmartProxy, Oxylabs, ou proxies statiques
"""
import asyncio
import random
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
import httpx
from loguru import logger

class ProxyProvider(Enum):
    BRIGHT_DATA = "bright_data"
    SCRAPER_API = "scraper_api"
    SMART_PROXY = "smart_proxy"
    OXYLABS = "oxylabs"
    STATIC = "static"

@dataclass
class ProxyConfig:
    """Configuration d'un proxy"""
    host: str
    port: int
    protocol: str = "http"
    username: Optional[str] = None
    password: Optional[str] = None
    provider: ProxyProvider = ProxyProvider.STATIC
    country: Optional[str] = None
    is_working: bool = True
    success_count: int = 0
    failure_count: int = 0
    last_used: Optional[float] = None
    response_time_avg: float = 0.0

    @property
    def url(self) -> str:
        if self.username and self.password:
            return f"{self.protocol}://{self.username}:{self.password}@{self.host}:{self.port}"
        return f"{self.protocol}://{self.host}:{self.port}"

    @property
    def score(self) -> float:
        """Calcule un score de fiabilité (0-100)"""
        if not self.is_working:
            return 0
        
        total = self.success_count + self.failure_count
        if total == 0:
            return 50  # Score neutre par défaut
        
        success_rate = self.success_count / total
        
        # Bonus pour temps de réponse rapide
        time_bonus = max(0, 50 - self.response_time_avg)
        
        return (success_rate * 50) + time_bonus

class ProxyManager:
    """
    Gestionnaire de proxies avec:
    - Rotation automatique basée sur le score
    - Détection d'échec et blacklist automatique
    - Support multi-providers
    - Géolocalisation
    """
    
    def __init__(
        self,
        provider: ProxyProvider = ProxyProvider.STATIC,
        api_key: Optional[str] = None,
        proxy_list: Optional[list] = None,
        max_failures: int = 3,
        cooldown_time: int = 300  # 5 minutes
    ):
        self.provider = provider
        self.api_key = api_key
        self.max_failures = max_failures
        self.cooldown_time = cooldown_time
        
        # Pool de proxies
        self.proxies: dict[str, ProxyConfig] = {}
        self.blacklist: dict[str, float] = {}  # proxy -> timestamp de débannissement
        
        # Initialiser les proxies
        if proxy_list:
            for p in proxy_list:
                self.add_proxy(p)
        
        # Métriques
        self.stats = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "proxy_rotations": 0
        }
        
        logger.info(f"ProxyManager initialisé avec provider: {provider.value}")
    
    def add_proxy(self, proxy_data: dict) -> None:
        """Ajoute un proxy au pool"""
        proxy = ProxyConfig(
            host=proxy_data.get("host"),
            port=proxy_data.get("port"),
            protocol=proxy_data.get("protocol", "http"),
            username=proxy_data.get("username"),
            password=proxy_data.get("password"),
            provider=self.provider,
            country=proxy_data.get("country")
        )
        self.proxies[proxy.url] = proxy
        logger.debug(f"Proxy ajouté: {proxy.host}:{proxy.port}")
    
    async def get_proxy(
        self,
        country: Optional[str] = None,
        exclude_blacklisted: bool = True
    ) -> Optional[ProxyConfig]:
        """
        Retourne le meilleur proxy disponible selon:
        1. Pas dans la blacklist
        2. Score le plus élevé
        3. Géographie correspondante (si demandée)
        """
        current_time = time.time()
        
        # Nettoyer la blacklist expirée
        self._cleanup_blacklist(current_time)
        
        candidates = []
        
        for proxy in self.proxies.values():
            # Ignorer si blacklisté
            if exclude_blacklisted and proxy.url in self.blacklist:
                continue
            
            # Ignorer si trop d'échecs récents
            if proxy.failure_count >= self.max_failures:
                continue
            
            # Filtrer par pays si demandé
            if country and proxy.country and proxy.country.lower() != country.lower():
                continue
            
            candidates.append(proxy)
        
        if not candidates:
            logger.warning("Aucun proxy disponible!")
            return None
        
        # Trier par score (décroissant)
        candidates.sort(key=lambda p: p.score, reverse=True)
        
        selected = candidates[0]
        selected.last_used = current_time
        self.stats["proxy_rotations"] += 1
        
        logger.debug(f"Proxy sélectionné: {selected.host}:{selected.port} (score: {selected.score:.1f})")
        return selected
    
    def report_success(self, proxy: ProxyConfig, response_time: float) -> None:
        """Signale un succès pour ce proxy"""
        proxy.success_count += 1
        
        # Mise à jour du temps de réponse moyen (EWMA)
        if proxy.response_time_avg == 0:
            proxy.response_time_avg = response_time
        else:
            proxy.response_time_avg = 0.7 * proxy.response_time_avg + 0.3 * response_time
        
        self.stats["successful_requests"] += 1
        logger.debug(f"Proxy OK: {proxy.host} - avg response: {proxy.response_time_avg:.2f}s")
    
    def report_failure(self, proxy: ProxyConfig) -> None:
        """Signale un échec pour ce proxy"""
        proxy.failure_count += 1
        self.stats["failed_requests"] += 1
        
        if proxy.failure_count >= self.max_failures:
            self._blacklist_proxy(proxy)
            logger.warning(f"Proxy blacklisté après {proxy.failure_count} échecs: {proxy.host}:{proxy.port}")
    
    def _blacklist_proxy(self, proxy: ProxyConfig) -> None:
        """Ajoute un proxy à la blacklist"""
        proxy.is_working = False
        self.blacklist[proxy.url] = time.time() + self.cooldown_time
    
    def _cleanup_blacklist(self, current_time: float) -> None:
        """Supprime les proxies expirés de la blacklist"""
        expired = [
            url for url, ts in self.blacklist.items()
            if ts < current_time
        ]
        
        for url in expired:
            del self.blacklist[url]
            if url in self.proxies:
                self.proxies[url].is_working = True
                self.proxies[url].failure_count = 0
                logger.info(f"Proxy débanni: {self.proxies[url].host}")
    
    async def test_proxy(self, proxy: ProxyConfig, test_url: str = "https://httpbin.org/ip") -> bool:
        """Teste si un proxy fonctionne"""
        try:
            async with httpx.AsyncClient(proxies=proxy.url, timeout=10) as client:
                start = time.time()
                response = await client.get(test_url)
                response_time = time.time() - start
                
                if response.status_code == 200:
                    self.report_success(proxy, response_time)
                    return True
                else:
                    self.report_failure(proxy)
                    return False
        except Exception as e:
            logger.error(f"Test proxy échoué: {e}")
            self.report_failure(proxy)
            return False
    
    async def health_check_all(self) -> dict:
        """Vérifie la santé de tous les proxies"""
        results = {"healthy": [], "unhealthy": [], "total": len(self.proxies)}
        
        for proxy in self.proxies.values():
            is_healthy = await self.test_proxy(proxy)
            if is_healthy:
                results["healthy"].append(proxy.host)
            else:
                results["unhealthy"].append(proxy.host)
        
        logger.info(f"Health check: {len(results['healthy'])}/{results['total']} proxies OK")
        return results
    
    def get_stats(self) -> dict:
        """Retourne les statistiques du manager"""
        return {
            **self.stats,
            "active_proxies": len([p for p in self.proxies.values() if p.is_working]),
            "blacklisted_proxies": len(self.blacklist)
        }
    
    @staticmethod
    def from_env() -> "ProxyManager":
        """Crée un ProxyManager depuis les variables d'environnement"""
        import os
        
        provider = ProxyProvider(os.getenv("PROXY_PROVIDER", "static"))
        api_key = os.getenv("PROXY_API_KEY")
        
        # Charger les proxies statiques si disponibles
        proxy_list = []
        static_proxies = os.getenv("STATIC_PROXIES", "")
        if static_proxies:
            for p in static_proxies.split(","):
                parts = p.strip().split(":")
                if len(parts) >= 2:
                    proxy_list.append({
                        "host": parts[0],
                        "port": int(parts[1]),
                        "protocol": parts[2] if len(parts) > 2 else "http"
                    })
        
        return ProxyManager(
            provider=provider,
            api_key=api_key,
            proxy_list=proxy_list if proxy_list else None
        )
