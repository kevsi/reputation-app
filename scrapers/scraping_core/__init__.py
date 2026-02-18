"""
Scraping Core Module
====================
Modules core pour le système de scraping amélioré:
- Proxy Manager: Rotation intelligente de proxies
- Playwright Engine: Navigation headless avec stealth
- Anti-Detection: Contournement des protections
- Smart Scheduler: Planification intelligente

Usage:
    from scraping_core import PlaywrightEngine, ProxyManager, AntiDetectionSystem, SmartScheduler
    
    # Initialisation
    proxy_manager = ProxyManager.from_env()
    playwright = PlaywrightEngine(proxy_manager=proxy_manager)
    anti_detect = AntiDetectionSystem()
    scheduler = SmartScheduler()
"""
from .proxy_manager import ProxyManager, ProxyConfig, ProxyProvider
from .playwright_engine import PlaywrightEngine, BrowserConfig, BrowserType, ScrapedItem
from .anti_detection import (
    AntiDetectionSystem, 
    DetectionResult, 
    BlockageType,
    CaptchaConfig,
    RateLimiter
)
from .smart_scheduler import (
    SmartScheduler, 
    SourceConfig, 
    ScrapingTask, 
    Priority, 
    SourceStatus
)

__all__ = [
    # Proxy Manager
    "ProxyManager",
    "ProxyConfig", 
    "ProxyProvider",
    
    # Playwright Engine
    "PlaywrightEngine",
    "BrowserConfig",
    "BrowserType",
    "ScrapedItem",
    
    # Anti-Detection
    "AntiDetectionSystem",
    "DetectionResult",
    "BlockageType",
    "CaptchaConfig",
    "RateLimiter",
    
    # Smart Scheduler
    "SmartScheduler",
    "SourceConfig",
    "ScrapingTask",
    "Priority",
    "SourceStatus",
]

__version__ = "2.0.0"
