from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """Configuration de l'API Scrapers"""
    
    # API Settings
    app_name: str = "Sentinelle Scrapers API"
    version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8001
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5000"]
    
    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_per_minute: int = 60
    
    # External APIs
    google_api_key: Optional[str] = None
    news_api_key: Optional[str] = None
    twitter_bearer_token: Optional[str] = None
    reddit_client_id: Optional[str] = None
    reddit_client_secret: Optional[str] = None
    youtube_api_key: Optional[str] = None
    
    # Timeouts
    http_timeout: int = 30  # secondes
    scraping_timeout: int = 300  # 5 minutes max
    
    # Retry
    max_retries: int = 3
    retry_delay: int = 2  # secondes
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/scrapers.log"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

settings = Settings()
