
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

    # Models Initialization on Startup (Non-blocking)
    @app.on_event("startup")
    async def startup_event():
        import asyncio
        
        def load_models():
            from ..models.sentiment_analyzer import SentimentAnalyzer
            from ..models.emotion_detector import EmotionDetector
            from ..models.keyword_extractor import KeywordExtractor
            try:
                SentimentAnalyzer().initialize()
                EmotionDetector().initialize()
                KeywordExtractor().initialize()
            except Exception as e:
                print(f"Background model loading error: {e}")

        # Run loading in a separate thread so it doesn't block the server startup
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, load_models)


    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
