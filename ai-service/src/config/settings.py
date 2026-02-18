
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 2
    LOG_LEVEL: str = "info"

    # CORS - Restrict to specific origins in production
    CORS_ORIGINS: str = "*"  # Comma-separated list of allowed origins
    
    # Models
    SENTIMENT_MODEL: str = "nlptown/bert-base-multilingual-uncased-sentiment"
    EMOTION_MODEL: str = "j-hartmann/emotion-english-distilroberta-base"
    USE_GPU: bool = False

    # Cache
    ENABLE_CACHE: bool = True
    CACHE_SIZE: int = 1000
    CACHE_TTL_SECONDS: int = 3600

    # Preprocessing
    MAX_TEXT_LENGTH: int = 5000
    REMOVE_URLS: bool = True
    REMOVE_EMOJIS: bool = False

    # Performance
    BATCH_SIZE: int = 16
    MODEL_QUANTIZATION: bool = False

    # Monitoring
    ENABLE_METRICS: bool = False
    METRICS_PORT: int = 9090

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
