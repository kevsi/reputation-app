"""
Unified Scraping Engine
=======================
Fait la jointure entre tous les modules de scraping:
- Proxy Manager
- Playwright Engine  
- Anti-Detection
- Rate Limiter

Fournit une interface unifiée pour le scraping de toutes les sources
"""
import asyncio
from dataclasses import dataclass
from typing import Optional, Callable
from enum import Enum

from .proxy_manager import ProxyManager, ProxyConfig
from .playwright_engine import PlaywrightEngine, BrowserConfig, ScrapedItem
from .anti_detection import AntiDetectionSystem, RateLimiter, DetectionResult, BlockageType
from .smart_scheduler import SmartScheduler, SourceConfig, Priority
from loguru import logger

class ScrapingMethod(Enum):
    """Méthodes de scraping disponibles"""
    CHEERIO = "cheerio"        # Static HTML (rapide)
    PLAYWRIGHT = "playwright"  # JavaScript (complet)
    API = "api"                # API officielle
    SCRAPY = "scrapy"          # Scrapy (fallback)

@dataclass
class ScrapingConfig:
    """Configuration globale du scraper"""
    method: ScrapingMethod = ScrapingMethod.PLAYWRIGHT
    use_proxy: bool = True
    use_stealth: bool = True
    headless: bool = True
    timeout: int = 30000
    max_retries: int = 3
    rate_limit: int = 10  # req/min
    
@dataclass
class ScrapingResult:
    """Résultat du scraping"""
    success: bool
    data: Optional[ScrapedItem]
    error: Optional[str]
    method_used: ScrapingMethod
    proxy_used: Optional[str]
    detection_result: Optional[DetectionResult]
    execution_time: float

class UnifiedScrapingEngine:
    """
    Moteur de scraping unifié qui:
    - Choisit automatiquement la meilleure méthode
    - Gère les proxies de manière transparente
    - Détecte et gère les blocages
    - Limite le taux de requêtes
    """
    
    def __init__(self, config: ScrapingConfig):
        self.config = config
        
        # Initialiser les composants
        self.proxy_manager = ProxyManager.from_env() if config.use_proxy else None
        self.anti_detect = AntiDetectionSystem()
        self.rate_limiter = RateLimiter()
        self.scheduler: Optional[SmartScheduler] = None
        
        # Pool de navigateurs
        self.playwright_pool: list[PlaywrightEngine] = []
        self.max_browsers = 3
        
        logger.info(f"UnifiedScrapingEngine initialisé (method: {config.method.value})")
    
    async def initialize(self) -> None:
        """Initialise les ressources"""
        # Pré-créer des navigateurs si nécessaire
        if self.config.method in [ScrapingMethod.PLAYWRIGHT, ScrapingMethod.CHEERIO]:
            await self._init_browser_pool()
        
        # Initialiser le scheduler
        self.scheduler = SmartScheduler(
            max_concurrent=self.config.max_retries,
            check_interval=30
        )
        
        logger.info("UnifiedScrapingEngine prêt")
    
    async def _init_browser_pool(self) -> None:
        """Initialise le pool de navigateurs"""
        for _ in range(self.max_browsers):
            browser_config = BrowserConfig(
                headless=self.config.headless,
                stealth=self.config.use_stealth,
                page_load_timeout=self.config.timeout
            )
            
            engine = PlaywrightEngine(
                proxy_manager=self.proxy_manager,
                config=browser_config
            )
            await engine.start()
            self.playwright_pool.append(engine)
        
        logger.info(f"Pool de {len(self.playwright_pool)} navigateurs créé")
    
    async def scrape(
        self,
        url: str,
        selectors: dict,
        source_type: str = "generic",
        country: Optional[str] = None
    ) -> ScrapingResult:
        """
        Scrape une URL avec la méthode optimale
        
        Args:
            url: URL cible
            selectors: Sélecteurs CSS pour l'extraction
            source_type: Type de source (trustpilot, google, etc.)
            country: Pays cible pour le proxy
            
        Returns:
            ScrapingResult avec les données ou l'erreur
        """
        import time
        start_time = time.time()
        
        # Extraire le domaine pour le rate limiting
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        
        # Appliquer le rate limiting
        await self.rate_limiter.acquire(domain)
        
        # Obtenir un proxy si activé
        proxy = None
        if self.proxy_manager:
            proxy = await self.proxy_manager.get_proxy(country=country)
        
        # Essayer la méthode principale
        result = await self._try_scraping(
            url, selectors, proxy, self.config.method
        )
        
        # Si échoué et retries disponibles, réessayer avec fallback
        if not result.success and self.config.max_retries > 1:
            for attempt in range(1, self.config.max_retries):
                logger.info(f"Retry {attempt + 1}/{self.config.max_retries}")
                
                # Changer de proxy si disponible
                if self.proxy_manager and proxy:
                    await self.proxy_manager.report_failure(proxy)
                    proxy = await self.proxy_manager.get_proxy(country=country)
                
                # Essayer avec une méthode différente
                fallback_method = self._get_fallback_method(self.config.method)
                result = await self._try_scraping(
                    url, selectors, proxy, fallback_method
                )
                
                if result.success:
                    break
        
        # Signaler le résultat au proxy manager
        if self.proxy_manager and proxy:
            if result.success:
                await self.proxy_manager.report_success(proxy, time.time() - start_time)
            else:
                await self.proxy_manager.report_failure(proxy)
        
        result.execution_time = time.time() - start_time
        return result
    
    async def _try_scraping(
        self,
        url: str,
        selectors: dict,
        proxy: Optional[ProxyConfig],
        method: ScrapingMethod
    ) -> ScrapingResult:
        """Tente de scraper avec une méthode spécifique"""
        
        try:
            if method == ScrapingMethod.PLAYWRIGHT:
                return await self._scrape_with_playwright(url, selectors, proxy)
            elif method == ScrapingMethod.CHEERIO:
                return await self._scrape_with_cheerio(url, selectors)
            elif method == ScrapingMethod.API:
                return await self._scrape_with_api(url, selectors)
            else:
                return ScrapingResult(
                    success=False,
                    data=None,
                    error=f"Méthode non supportée: {method}",
                    method_used=method,
                    proxy_used=proxy.url if proxy else None,
                    detection_result=None,
                    execution_time=0
                )
                
        except Exception as e:
            logger.error(f"Erreur {method.value}: {e}")
            return ScrapingResult(
                success=False,
                data=None,
                error=str(e),
                method_used=method,
                proxy_used=proxy.url if proxy else None,
                detection_result=None,
                execution_time=0
            )
    
    async def _scrape_with_playwright(
        self,
        url: str,
        selectors: dict,
        proxy: Optional[ProxyConfig]
    ) -> ScrapingResult:
        """Scrape avec Playwright"""
        
        # Obtenir un navigateur du pool
        engine = self._get_available_browser()
        
        try:
            # Configurer le proxy si disponible
            if proxy:
                engine.config.proxy = proxy
            
            # Effectuer le scraping
            data = await engine.scrape(url, selectors, proxy)
            
            # Détecter les blocages
            detection = await self.anti_detect.detect_blockage(
                response=type('obj', (object,), {'status_code': 200, 'headers': {}})(),
                html=data.html
            )
            
            return ScrapingResult(
                success=True,
                data=data,
                error=None,
                method_used=ScrapingMethod.PLAYWRIGHT,
                proxy_used=proxy.url if proxy else None,
                detection_result=detection,
                execution_time=0
            )
            
        finally:
            # Remettre le navigateur dans le pool
            self._release_browser(engine)
    
    async def _scrape_with_cheerio(
        self,
        url: str,
        selectors: dict
    ) -> ScrapingResult:
        """Scrape avec Cheerio (statique)"""
        import httpx
        from bs4 import BeautifulSoup
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url)
            
            # Détecter les blocages
            detection = await self.anti_detect.detect_blockage(
                response=response,
                html=response.text
            )
            
            if detection.is_blocked:
                return ScrapingResult(
                    success=False,
                    data=None,
                    error=f"Blocked: {detection.blockage_type.value}",
                    method_used=ScrapingMethod.CHEERIO,
                    proxy_used=None,
                    detection_result=detection,
                    execution_time=0
                )
            
            soup = BeautifulSoup(response.text, "lxml")
            
            # Extraire les données
            data = {}
            for name, selector in selectors.items():
                elements = soup.select(selector)
                if len(elements) == 1:
                    data[name] = elements[0].get_text(strip=True)
                else:
                    data[name] = [e.get_text(strip=True) for e in elements]
            
            from .playwright_engine import ScrapedItem
            scraped = ScrapedItem(
                url=url,
                title=soup.title.string if soup.title else None,
                content=str(data),
                html=response.text,
                links=[a.get("href") for a in soup.find_all("a", href=True)][:50],
                images=[img.get("src") for img in soup.find_all("img", src=True)][:20],
                metadata={"method": "cheerio"}
            )
            
            return ScrapingResult(
                success=True,
                data=scraped,
                error=None,
                method_used=ScrapingMethod.CHEERIO,
                proxy_used=None,
                detection_result=detection,
                execution_time=0
            )
    
    async def _scrape_with_api(
        self,
        url: str,
        selectors: dict
    ) -> ScrapingResult:
        """Fallback vers API (à implémenter selon la source)"""
        return ScrapingResult(
            success=False,
            data=None,
            error="API scraping non implémenté pour cette source",
            method_used=ScrapingMethod.API,
            proxy_used=None,
            detection_result=None,
            execution_time=0
        )
    
    def _get_available_browser(self) -> PlaywrightEngine:
        """Obtient un navigateur disponible du pool"""
        # Pool simple: premier navigateur disponible
        # TODO: Implémenter un vrai pool avec sémaphore
        return self.playwright_pool[0]
    
    def _release_browser(self, engine: PlaywrightEngine) -> None:
        """Libère un navigateur"""
        # Pas d'action nécessaire pour le pool simple
        pass
    
    def _get_fallback_method(self, current: ScrapingMethod) -> ScrapingMethod:
        """Retourne la méthode de fallback"""
        fallbacks = {
            ScrapingMethod.PLAYWRIGHT: ScrapingMethod.CHEERIO,
            ScrapingMethod.CHEERIO: ScrapingMethod.SCRAPY,
            ScrapingMethod.SCRAPY: ScrapingMethod.API,
        }
        return fallbacks.get(current, ScrapingMethod.CHEERIO)
    
    async def scrape_source(
        self,
        source: SourceConfig,
        selectors: dict
    ) -> ScrapingResult:
        """
        Scrape une source configurée
        
        Args:
            source: Configuration de la source
            selectors: Sélecteurs pour l'extraction
            
        Returns:
            ScrapingResult
        """
        return await self.scrape(
            url=source.url,
            selectors=selectors,
            source_type=source.source_type,
            country=source.country
        )
    
    async def shutdown(self) -> None:
        """Arrête le moteur et libère les ressources"""
        # Arrêter le scheduler
        if self.scheduler:
            await self.scheduler.stop()
        
        # Arrêter les navigateurs
        for engine in self.playwright_pool:
            await engine.stop()
        
        logger.info("UnifiedScrapingEngine arrêté")
    
    def get_stats(self) -> dict:
        """Retourne les statistiques"""
        stats = {
            "engine": "unified",
            "method": self.config.method.value,
            "browser_pool_size": len(self.playwright_pool),
        }
        
        if self.proxy_manager:
            stats["proxy"] = self.proxy_manager.get_stats()
        
        if self.scheduler:
            stats["scheduler"] = self.scheduler.get_stats()
        
        return stats


# Instance globale
_engine: Optional[UnifiedScrapingEngine] = None

async def get_engine() -> UnifiedScrapingEngine:
    """Retourne l'instance globale du moteur"""
    global _engine
    if _engine is None:
        _engine = UnifiedScrapingEngine(ScrapingConfig())
        await _engine.initialize()
    return _engine
