"""
Anti-Detection Module - Système complet de contournement des protections
Gère: Cloudflare, reCAPTCHA, WAF, fingerprinting, etc.
"""
import asyncio
import random
import hashlib
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Callable
import httpx
from loguru import logger

class BlockageType(Enum):
    NONE = "none"
    CLOUDFLARE = "cloudflare"
    RECAPTCHA_V2 = "recaptcha_v2"
    RECAPTCHA_V3 = "recaptcha_v3"
    H_CAPTCHA = "h_captcha"
    WAF = "waf"
    RATE_LIMIT = "rate_limit"
    IP_BLOCKED = "ip_blocked"
    UNKNOWN = "unknown"

@dataclass
class DetectionResult:
    """Résultat de la détection"""
    is_blocked: bool
    blockage_type: BlockageType
    message: str
    details: dict
    solutions: list[str]

@dataclass
class CaptchaConfig:
    """Configuration pour la résolution de CAPTCHA"""
    provider: str = "2captcha"  # 2captcha, anticaptcha
    api_key: str = ""
    timeout: int = 120
    poll_interval: int = 5

class AntiDetectionSystem:
    """
    Système anti-détection complet qui:
    - Détecte les blocages (Cloudflare, CAPTCHA, WAF)
    - Contourne automatiquement les protections
    - Gère la résolution de CAPTCHA
    - Simule un comportement humain
    """
    
    def __init__(
        self,
        captcha_config: Optional[CaptchaConfig] = None,
        retry_count: int = 3,
        delay_between_retries: int = 5
    ):
        self.captcha_config = captcha_config
        self.retry_count = retry_count
        self.delay_between_retries = delay_between_retries
        
        # Patterns de détection
        self.blockage_patterns = {
            BlockageType.CLOUDFLARE: [
                "cloudflare",
                "checking your browser",
                "just a moment",
                "cf-ray",
                "__cf_bm",
                "cf-clearance"
            ],
            BlockageType.RECAPTCHA_V2: [
                "recaptcha",
                "g-recaptcha",
                "data-sitekey",
                "recaptcha/api.js"
            ],
            BlockageType.RECAPTCHA_V3: [
                "recaptcha",
                " grecaptcha"
            ],
            BlockageType.H_CAPTCHA: [
                "hcaptcha",
                "h-captcha",
                "data-sitekey"
            ],
            BlockageType.WAF: [
                "403 Forbidden",
                "access denied",
                "security check",
                "blocked",
                "suspicious activity"
            ],
            BlockageType.RATE_LIMIT: [
                "rate limit",
                "too many requests",
                "429",
                "please wait"
            ],
            BlockageType.IP_BLOCKED: [
                "ip blocked",
                "banned",
                "blocked ip"
            ]
        }
        
        logger.info("AntiDetectionSystem initialisé")
    
    async def detect_blockage(
        self,
        response: httpx.Response,
        html: str = ""
    ) -> DetectionResult:
        """
        Analyse une réponse HTTP pour détecter un blocage
        
        Args:
            response: Réponse HTTP
            html: Contenu HTML de la réponse
            
        Returns:
            DetectionResult avec le type de blocage détecté
        """
        status_code = response.status_code
        headers = dict(response.headers)
        html_lower = html.lower()
        
        # Vérifier le status code
        if status_code == 403:
            return DetectionResult(
                is_blocked=True,
                blockage_type=BlockageType.WAF,
                message="WAF Blocked (403)",
                details={"status": status_code, "headers": headers},
                solutions=[
                    "Utiliser un proxy différent",
                    "Ajouter un User-Agent différent",
                    "Attendre avant de réessayer"
                ]
            )
        
        if status_code == 429:
            return DetectionResult(
                is_blocked=True,
                blockage_type=BlockageType.RATE_LIMIT,
                message="Rate Limited (429)",
                details={"status": status_code},
                solutions=[
                    "Réduire la fréquence de requête",
                    "Utiliser un proxy rotatif",
                    "Attendre avant de réessayer"
                ]
            )
        
        # Analyser le contenu HTML
        for blockage_type, patterns in self.blockage_patterns.items():
            if blockage_type == BlockageType.NONE:
                continue
            
            for pattern in patterns:
                if pattern.lower() in html_lower:
                    return DetectionResult(
                        is_blocked=True,
                        blockage_type=blockage_type,
                        message=f"Détection: {blockage_type.value}",
                        details={"pattern": pattern, "status": status_code},
                        solutions=self._get_solutions(blockage_type)
                    )
        
        # Vérifier les cookies Cloudflare
        if "cf-ray" in headers or "cf-clearance" in headers:
            return DetectionResult(
                is_blocked=True,
                blockage_type=BlockageType.CLOUDFLARE,
                message="Cloudflare Protection",
                details={"headers": headers},
                solutions=self._get_solutions(BlockageType.CLOUDFLARE)
            )
        
        # Pas de blocage détecté
        return DetectionResult(
            is_blocked=False,
            blockage_type=BlockageType.NONE,
            message="Pas de blocage détecté",
            details={},
            solutions=[]
        )
    
    def _get_solutions(self, blockage_type: BlockageType) -> list[str]:
        """Retourne les solutions pour un type de blocage"""
        solutions = {
            BlockageType.CLOUDFLARE: [
                "Utiliser Playwright avec stealth mode",
                "Changer de proxy (IP différente)",
                "Attendre quelques minutes",
                "Utiliser un navigateur non-headed"
            ],
            BlockageType.RECAPTCHA_V2: [
                "Résoudre le CAPTCHA via 2Captcha/Anti-Captcha",
                "Utiliser des proxies résidentiels",
                "Simuler un comportement humain"
            ],
            BlockageType.RECAPTCHA_V3: [
                "Utiliser des proxies de haute qualité",
                "Simuler des actions humaines",
                "Collecter des tokens via des services"
            ],
            BlockageType.H_CAPTCHA: [
                "Résoudre via un service de CAPTCHA",
                "Utiliser des proxies résidentiels"
            ],
            BlockageType.WAF: [
                "Changer de proxy",
                "Modifier les headers",
                "Réduire la fréquence de requêtes"
            ],
            BlockageType.RATE_LIMIT: [
                "Réduire la fréquence",
                "Utiliser plus de proxies",
                "Implementer un backoff exponentiel"
            ],
            BlockageType.IP_BLOCKED: [
                "Changer d'IP immédiatement",
                "Utiliser des proxies résidentiels",
                "Attendre 24-48h pour déblocage"
            ]
        }
        return solutions.get(blockage_type, ["Contactez le support"])
    
    async def solve_recaptcha(
        self,
        site_key: str,
        page_url: str
    ) -> Optional[str]:
        """
        Résout un reCAPTCHA via un service externe
        
        Args:
            site_key: Clé site du CAPTCHA
            page_url: URL de la page avec le CAPTCHA
            
        Returns:
            Token de résolution ou None
        """
        if not self.captcha_config or not self.captcha_config.api_key:
            logger.warning("Configuration CAPTCHA manquante")
            return None
        
        try:
            # Soumettre le CAPTCHA
            submit_url = f"http://2captcha.com/in.php"
            async with httpx.AsyncClient() as client:
                response = await client.post(submit_url, data={
                    "key": self.captcha_config.api_key,
                    "method": "userrecaptcha",
                    "googlekey": site_key,
                    "pageurl": page_url,
                    "json": 1
                })
                
                result = response.json()
                if result.get("status") != 1:
                    logger.error(f"Erreur soumission CAPTCHA: {result}")
                    return None
                
                captcha_id = result.get("request")
                
                # Attendre la résolution
                for _ in range(self.captcha_config.timeout // self.captcha_config.poll_interval):
                    await asyncio.sleep(self.captcha_config.poll_interval)
                    
                    result_response = await client.get(
                        f"http://2captcha.com/res.php",
                        params={
                            "key": self.captcha_config.api_key,
                            "action": "get",
                            "id": captcha_id,
                            "json": 1
                        }
                    )
                    
                    result_data = result_response.json()
                    if result_data.get("status") == 1:
                        token = result_data.get("request")
                        logger.info("CAPTCHA résolu avec succès")
                        return token
                    elif result_data.get("request") == "CAPCHA_NOT_READY":
                        continue
                    else:
                        logger.error(f"Erreur résolution: {result_data}")
                        return None
                
                logger.warning("Timeout résolution CAPTCHA")
                return None
                
        except Exception as e:
            logger.error(f"Erreur solve_recaptcha: {e}")
            return None
    
    async def bypass_cloudflare(
        self,
        url: str,
        headers: dict,
        cookies: dict
    ) -> dict:
        """
        Tente de contourner Cloudflare en simulant un navigateur
        
        Note: Playwright est plus efficace pour cela
        Cette méthode est un fallback pour les requêtes simples
        """
        # Ajouter des headers plus réalistes
        enhanced_headers = {
            **headers,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0"
        }
        
        return enhanced_headers
    
    async def handle_blockage(
        self,
        detection: DetectionResult,
        url: str,
        scraper_func: Callable
    ) -> any:
        """
        Gère automatiquement un blocage avec retry et solutions
        
        Args:
            detection: Résultat de la détection
            url: URL cible
            scraper_func: Fonction à exécuter pour le scraping
            
        Returns:
            Résultat du scraping
        """
        if not detection.is_blocked:
            return await scraper_func()
        
        logger.warning(f"Blocage détecté: {detection.message}")
        logger.info(f"Solutions: {', '.join(detection.solutions[:2])}")
        
        # Implémenter le retry avec backoff
        for attempt in range(self.retry_count):
            wait_time = self.delay_between_retries * (2 ** attempt)  # Exponential backoff
            wait_time += random.uniform(0, 2)  # Jitter
            
            logger.info(f"Retry {attempt + 1}/{self.retry_count} dans {wait_time:.1f}s...")
            await asyncio.sleep(wait_time)
            
            try:
                result = await scraper_func()
                logger.info("Retry réussi!")
                return result
            except Exception as e:
                logger.warning(f"Retry échoué: {e}")
                continue
        
        raise Exception(f"Échec après {self.retry_count} tentatives: {detection.message}")
    
    def generate_fingerprint(self) -> dict:
        """
        Génère un fingerprint aléatoire mais cohérent
        
        Returns:
            Dict avec les paramètres de fingerprint
        """
        # Screen resolutions communes
        resolutions = [
            (1920, 1080),
            (1366, 768),
            (1536, 864),
            (1440, 900),
            (1280, 720)
        ]
        
        # Timezones
        timezones = [
            "Europe/Paris",
            "Europe/London",
            "Europe/Berlin",
            "America/New_York",
            "America/Los_Angeles"
        ]
        
        # Languages
        languages = [
            "fr-FR,fr;q=0.9,en;q=0.8",
            "en-US,en;q=0.9,fr;q=0.8",
            "en-GB,en;q=0.9"
        ]
        
        screen_width, screen_height = random.choice(resolutions)
        
        return {
            "screen": {
                "width": screen_width,
                "height": screen_height,
                "colorDepth": random.choice([24, 32]),
                "pixelRatio": random.choice([1, 1.25, 1.5, 2])
            },
            "timezone": random.choice(timezones),
            "language": random.choice(languages),
            "platform": random.choice([
                "Win32",
                "MacIntel",
                "Linux x86_64"
            ]),
            "hardwareConcurrency": random.choice([2, 4, 8, 16]),
            "deviceMemory": random.choice([2, 4, 8])
        }
    
    def calculate_request_hash(self, url: str, method: str = "GET") -> str:
        """Calcule un hash pour la déduplication des requêtes"""
        data = f"{method}:{url}"
        return hashlib.md5(data.encode()).hexdigest()


class RateLimiter:
    """
    Rate limiter intelligent par domaine
    Respecte les limites tout en maximisant le throughput
    """
    
    def __init__(self):
        self.domains: dict[str, list[float]] = {}
        self.limits = {
            "default": {"requests": 10, "window": 60},  # 10 req/min par défaut
            "trustpilot.com": {"requests": 5, "window": 60},
            "google.com": {"requests": 3, "window": 60},
            "twitter.com": {"requests": 15, "window": 60},
        }
    
    async def acquire(self, domain: str) -> float:
        """
        Acquiert une permission pour faire une requête
        
        Returns:
            Temps d'attente nécessaire (0 si aucune attente)
        """
        if domain not in self.domains:
            self.domains[domain] = []
        
        limit_config = self.limits.get(domain, self.limits["default"])
        max_requests = limit_config["requests"]
        window = limit_config["window"]
        
        now = asyncio.get_event_loop().time()
        
        # Filtrer les requêtes anciennes
        self.domains[domain] = [
            t for t in self.domains[domain]
            if now - t < window
        ]
        
        # Vérifier si on peut faire une requête
        if len(self.domains[domain]) < max_requests:
            self.domains[domain].append(now)
            return 0
        
        # Calculer le temps d'attente
        oldest = min(self.domains[domain])
        wait_time = window - (now - oldest) + random.uniform(0, 1)
        
        logger.debug(f"Rate limit pour {domain}, attente: {wait_time:.2f}s")
        await asyncio.sleep(wait_time)
        
        now = asyncio.get_event_loop().time()
        self.domains[domain].append(now)
        
        return wait_time
    
    def set_limit(self, domain: str, requests: int, window: int) -> None:
        """Configure une limite personnalisée pour un domaine"""
        self.limits[domain] = {"requests": requests, "window": window}
    
    def get_stats(self, domain: str) -> dict:
        """Retourne les statistiques pour un domaine"""
        if domain not in self.domains:
            return {"requests_made": 0, "limit": 0}
        
        limit_config = self.limits.get(domain, self.limits["default"])
        return {
            "requests_made": len(self.domains[domain]),
            "limit": limit_config["requests"],
            "window": limit_config["window"]
        }
