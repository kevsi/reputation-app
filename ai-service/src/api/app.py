
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ..config.settings import settings
from .routes import health, sentiment, emotions, keywords, topics, language

def create_app() -> FastAPI:
    app = FastAPI(
        title="Sentinelle AI Service",
        description="Microservice IA pour l'analyse de réputation (Sentiment, Emotions, Keywords)",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Models are loaded lazily on first request (not at startup)
    # This improves startup time and allows the service to respond quickly
    # Models will be loaded in the background when first needed
    
    # Note: If you need models preloaded for production, set PRELOAD_MODELS=true
    @app.on_event("startup")
    async def startup_event():
        import os
        
        # Only preload models if explicitly enabled (for production warm-up)
        preload_models = os.environ.get("PRELOAD_MODELS", "false").lower() == "true"
        
        if preload_models:
            def load_models():
                from ..models.sentiment_analyzer import SentimentAnalyzer
                from ..models.emotion_detector import EmotionDetector
                from ..models.keyword_extractor import KeywordExtractor
                try:
                    logger.info("Preloading AI models (PRELOAD_MODELS=true)")
                    SentimentAnalyzer().initialize()
                    EmotionDetector().initialize()
                    KeywordExtractor().initialize()
                    logger.info("AI models preloaded successfully")
                except Exception as e:
                    logger.error("Failed to preload models", error=str(e))
            
            # Load in background thread to not block startup
            import threading
            thread = threading.Thread(target=load_models, daemon=True)
            thread.start()

    # CORS - Restrict origins based on configuration
    # In production, set CORS_ORIGINS to specific domain(s)
    cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    
    # Validate CORS configuration for production
    if "*" in cors_origins and settings.LOG_LEVEL != "debug":
        import warnings
        warnings.warn(
            "⚠️ SECURITY WARNING: CORS is set to allow all origins (*). "
            "This is insecure for production! Set CORS_ORIGINS to specific domains.",
            UserWarning
        )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST"],  # Restrict methods
        allow_headers=["Content-Type", "Authorization"],  # Restrict headers
    )

    # Include Routes
    @app.get("/")
    async def root():
        return {
            "message": "Sentinelle AI Service is running",
            "status": "online",
            "docs": "/docs",
            "health": "/health"
        }

    app.include_router(health.router, tags=["Health"])
    app.include_router(sentiment.router, tags=["Analysis"])
    app.include_router(emotions.router, tags=["Analysis"])
    app.include_router(keywords.router, tags=["Analysis"])
    app.include_router(topics.router, tags=["Analysis"])
    app.include_router(language.router, tags=["Detection"])

    return app
