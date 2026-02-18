"""
Playwright Engine - Navigation headless avec anti-détection
Gère le rendu JavaScript et les sites modernes protégés
"""
import asyncio
import random
import time
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Callable, Any
from playwright.async_api import async_playwright, Browser, Page, ProxySettings
from loguru import logger

# Import du gestionnaire de proxies
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from scraping_core.proxy_manager import ProxyManager, ProxyConfig

class BrowserType(Enum):
    CHROMIUM = "chromium"
    FIREFOX = "firefox"
    WEBKIT = "webkit"

@dataclass
class ScrapedItem:
    """Données extraites d'une page"""
    url: str
    title: Optional[str]
    content: str
    html: str
    links: list[str]
    images: list[str]
    metadata: dict
    screenshots: Optional[list] = None

@dataclass
class BrowserConfig:
    """Configuration du navigateur"""
    browser_type: BrowserType = BrowserType.CHROMIUM
    headless: bool = True
    proxy: Optional[ProxyConfig] = None
    user_agent: Optional[str] = None
    viewport_width: int = 1920
    viewport_height: int = 1080
    locale: str = "fr-FR"
    timezone: str = "Europe/Paris"
    page_load_timeout: int = 30000
    navigation_timeout: int = 30000
    stealth: bool = True
    randomize_fingerprint: bool = True

class PlaywrightEngine:
    """
    Moteur de scraping basé sur Playwright avec:
    - Gestion de proxies intégrée
    - Mode stealth (anti-détection)
    - Simulation comportementale humaine
    - Gestion du Cloudflare et autres protections
    """
    
    # Pool de user-agents réalistes
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
    ]
    
    def __init__(
        self,
        proxy_manager: Optional[ProxyManager] = None,
        config: Optional[BrowserConfig] = None
    ):
        self.proxy_manager = proxy_manager
        self.config = config or BrowserConfig()
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.contexts: list = []  # Pool de contexts
        
        # Métriques
        self.stats = {
            "pages_loaded": 0,
            "pages_failed": 0,
            "total_time": 0.0
        }
        
        logger.info("PlaywrightEngine initialisé")
    
    async def __aenter__(self):
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.stop()
    
    async def start(self) -> None:
        """Démarre le navigateur"""
        self.playwright = await async_playwright().start()
        
        # Sélectionner le navigateur
        browser_type = getattr(self.playwright, self.config.browser_type.value)
        
        # Configurer les options de lancement
        launch_options = {
            "headless": self.config.headless,
            "args": self._get_browser_args()
        }
        
        # Ajouter le proxy si configuré
        if self.config.proxy:
            launch_options["proxy"] = ProxySettings(
                server=f"{self.config.proxy.protocol}://{self.config.proxy.host}:{self.config.proxy.port}",
                username=self.config.proxy.username,
                password=self.config.proxy.password
            )
        
        self.browser = await browser_type.launch(**launch_options)
        logger.info(f"Navigateur {self.config.browser_type.value} lancé")
    
    async def stop(self) -> None:
        """Arrête le navigateur et nettoie les ressources"""
        for context in self.contexts:
            try:
                await context.close()
            except:
                pass
        
        if self.browser:
            await self.browser.close()
        
        if self.playwright:
            await self.playwright.stop()
        
        logger.info("PlaywrightEngine arrêté")
    
    def _get_browser_args(self) -> list:
        """Arguments pour le lancement du navigateur (anti-détection)"""
        args = [
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
            "--window-size=1920,1080",
        ]
        
        if self.config.stealth:
            args.extend([
                "--disable-infobars",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
            ])
        
        return args
    
    async def create_context(self) -> Any:
        """Crée un nouveau contexte de navigation avec fingerprint randomisé"""
        context_options = {
            "viewport": {
                "width": self.config.viewport_width,
                "height": self.config.viewport_height
            },
            "locale": self.config.locale,
            "timezone_id": self.config.timezone,
            "geolocation": {"latitude": 48.8566, "longitude": 2.3522},  # Paris
            "permissions": ["geolocation"],
            "color_scheme": "light",
            "device_scale_factor": random.choice([1, 1.5, 2]),
        }
        
        # User-Agent personnalisé
        user_agent = self.config.user_agent or random.choice(self.USER_AGENTS)
        context_options["user_agent"] = user_agent
        
        context = await self.browser.new_context(**context_options)
        
        # Injecter le script stealth si activé
        if self.config.stealth:
            await self._apply_stealth(context)
        
        # Ajouter des listeners pour le comportement humain
        await self._add_behavior_listeners(context)
        
        self.contexts.append(context)
        return context
    
    async def _apply_stealth(self, context) -> None:
        """Applique les scripts anti-détection"""
        stealth_script = """
        // Override navigator.webdriver
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
        
        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
        
        // Chrome runtime
        window.chrome = window.chrome || {};
        
        // Add plugins
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5]
        });
        
        // Add languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['fr-FR', 'fr', 'en-US', 'en']
        });
        """
        
        await context.add_init_script(stealth_script)
    
    async def _add_behavior_listeners(self, context) -> None:
        """Ajoute des écouteurs pour simuler le comportement humain"""
        # Cette fonction peut être étendue pour simuler
        # les mouvements de souris, scrolls, etc.
        pass
    
    async def navigate(
        self,
        url: str,
        wait_for: Optional[str] = None,
        wait_until: str = "domcontentloaded",
        timeout: Optional[int] = None
    ) -> Page:
        """
        Navigate vers une URL avec gestion intelligente
        
        Args:
            url: URL cible
            wait_for: Sélecteur CSS à attendre
            wait_until: 'load', 'domcontentloaded', 'networkidle'
            timeout: Timeout en millisecondes
        """
        context = await self.create_context()
        page = await context.new_page()
        
        timeout = timeout or self.config.navigation_timeout
        
        try:
            logger.info(f"Navigation vers: {url}")
            
            # Petit délai aléatoire pour simuler un utilisateur
            await asyncio.sleep(random.uniform(0.1, 0.5))
            
            response = await page.goto(
                url,
                wait_until=wait_until,
                timeout=timeout
            )
            
            if response and response.status >= 400:
                logger.warning(f"Status code: {response.status} pour {url}")
            
            # Attendre un élément spécifique si demandé
            if wait_for:
                await page.wait_for_selector(wait_for, timeout=timeout)
            
            # Simulation humaine: scroll aléatoire
            await self._human_scroll(page)
            
            self.stats["pages_loaded"] += 1
            return page
            
        except Exception as e:
            self.stats["pages_failed"] += 1
            logger.error(f"Erreur de navigation: {e}")
            raise
    
    async def _human_scroll(self, page: Page) -> None:
        """Simule un scroll humain"""
        # Scroll en plusieurs étapes avec pauses
        for _ in range(random.randint(2, 5)):
            scroll_amount = random.randint(200, 800)
            await page.evaluate(f"window.scrollBy(0, {scroll_amount})")
            await asyncio.sleep(random.uniform(0.1, 0.3))
        
        # Remonter parfois
        if random.random() > 0.7:
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(random.uniform(0.1, 0.2))
    
    async def scrape(
        self,
        url: str,
        selectors: dict,
        proxy: Optional[ProxyConfig] = None
    ) -> ScrapedItem:
        """
        Scrappe une URL et extrait les données selon les sélecteurs
        
        Args:
            url: URL cible
            selectors: Dict de sélecteurs {nom: css_selector}
            proxy: Proxy spécifique à utiliser (sinon utilise le manager)
        """
        start_time = time.time()
        
        # Utiliser un proxy si fourni
        if proxy and not self.config.proxy:
            self.config.proxy = proxy
            await self.stop()
            await self.start()
        
        try:
            page = await self.navigate(url, wait_for=list(selectors.values())[0])
            
            # Extraire les données
            data = {}
            for name, selector in selectors.items():
                try:
                    elements = await page.query_selector_all(selector)
                    if len(elements) == 1:
                        data[name] = await elements[0].text_content()
                    else:
                        data[name] = await asyncio.gather(*[
                            el.text_content() for el in elements
                        ])
                except Exception as e:
                    logger.warning(f"Erreur extraction {name}: {e}")
                    data[name] = None
            
            # Extraire les métadonnées
            title = await page.title()
            html = await page.content()
            
            # Extraire les liens
            links = await page.eval_on_selector_all(
                "a[href]", 
                "elements => elements.map(el => el.href)"
            )
            
            # Extraire les images
            images = await page.eval_on_selector_all(
                "img[src]",
                "elements => elements.map(el => el.src)"
            )
            
            self.stats["total_time"] += time.time() - start_time
            
            return ScrapedItem(
                url=url,
                title=title,
                content=str(data),
                html=html,
                links=links[:50],  # Limiter à 50 liens
                images=images[:20],
                metadata={
                    "scraped_at": time.time(),
                    "selectors_used": list(selectors.keys()),
                    "extraction_time": time.time() - start_time
                }
            )
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping de {url}: {e}")
            raise
    
    async def click_and_wait(
        self,
        page: Page,
        selector: str,
        wait_for: str,
        timeout: int = 10000
    ) -> Page:
        """Clique sur un élément et attend le chargement"""
        await page.click(selector)
        await page.wait_for_selector(wait_for, timeout=timeout)
        await self._human_scroll(page)
        return page
    
    async def fill_and_submit(
        self,
        page: Page,
        form_data: dict,
        submit_selector: str
    ) -> Page:
        """Remplit un formulaire et le soumet"""
        for selector, value in form_data.items():
            await page.fill(selector, str(value))
            # Délai entre chaque champ
            await asyncio.sleep(random.uniform(0.1, 0.3))
        
        await page.click(submit_selector)
        await asyncio.sleep(random.uniform(0.5, 1.0))
        
        return page
    
    def get_stats(self) -> dict:
        """Retourne les statistiques"""
        avg_time = (
            self.stats["total_time"] / self.stats["pages_loaded"]
            if self.stats["pages_loaded"] > 0
            else 0
        )
        
        return {
            **self.stats,
            "success_rate": (
                self.stats["pages_loaded"] / 
                (self.stats["pages_loaded"] + self.stats["pages_failed"])
                if (self.stats["pages_loaded"] + self.stats["pages_failed"]) > 0
                else 0
            ),
            "avg_load_time": avg_time
        }
    
    async def take_screenshot(self, page: Page, path: str) -> bytes:
        """Prend une capture d'écran"""
        return await page.screenshot(path=path, full_page=True)


# Alias pour compatibilité
from typing import Any
