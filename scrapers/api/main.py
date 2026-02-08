from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
import sys
import time

from .config import settings
from .routes import (
    google_reviews,
    trustpilot,
    tripadvisor,
    facebook,
    twitter,
    reddit,
    news,
    rss,
    youtube,
)

# ==================== LOGGING ====================

logger.remove()  # Retirer le handler par défaut
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level=settings.log_level,
)
logger.add(
    settings.log_file,
    rotation="10 MB",
    retention="7 days",
    level=settings.log_level,
)

# ==================== APP SETUP ====================

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="API de scraping pour Sentinelle Reputation",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ==================== RATE LIMITING ====================

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ==================== CORS ====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MIDDLEWARE ====================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log toutes les requêtes"""
    start_time = time.time()
    
    logger.info(f"→ {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    logger.info(
        f"← {request.method} {request.url.path} - {response.status_code} - {duration:.2f}s"
    )
    
    return response

# ==================== EXCEPTION HANDLERS ====================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Gestion des erreurs de validation"""
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "data": [],
            "errors": [str(err) for err in exc.errors()],
            "metadata": {},
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Gestion des erreurs générales"""
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "data": [],
            "errors": [f"Internal server error: {str(exc)}"],
            "metadata": {},
        },
    )

# ==================== ROUTES ====================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "app": settings.app_name,
        "version": settings.version,
        "status": "running",
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
    }

# Include routers
app.include_router(google_reviews.router, prefix="/scrape", tags=["Google Reviews"])
app.include_router(trustpilot.router, prefix="/scrape", tags=["Trustpilot"])
app.include_router(tripadvisor.router, prefix="/scrape", tags=["TripAdvisor"])
app.include_router(facebook.router, prefix="/scrape", tags=["Facebook"])
app.include_router(twitter.router, prefix="/scrape", tags=["Twitter"])
app.include_router(reddit.router, prefix="/scrape", tags=["Reddit"])
app.include_router(news.router, prefix="/scrape", tags=["News"])
app.include_router(rss.router, prefix="/scrape", tags=["RSS"])
app.include_router(youtube.router, prefix="/scrape", tags=["YouTube"])

# ==================== STARTUP/SHUTDOWN ====================

@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 Starting {settings.app_name} v{settings.version}")
    logger.info(f"📊 Rate limiting: {settings.rate_limit_per_minute}/min")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down...")

# ==================== RUN ====================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "api.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
