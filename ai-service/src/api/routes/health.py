
from fastapi import APIRouter
import time
import psutil
import os
from ...schemas.responses import HealthResponse, ReadyResponse
from ...models.sentiment_analyzer import SentimentAnalyzer
from ...models.emotion_detector import EmotionDetector
from ...models.keyword_extractor import KeywordExtractor
from ...models.model_state import get_models_status

router = APIRouter()
START_TIME = time.time()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Liveness probe."""
    uptime = time.time() - START_TIME
    
    # Get models status from global state
    models_status = get_models_status()
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        models_loaded=models_status,
        uptime_seconds=uptime
    )

@router.get("/ready", response_model=ReadyResponse)
async def readiness_check():
    """Readiness probe. Checks if models are actually loaded in memory."""
    
    loaded_count = 0
    if SentimentAnalyzer._model: loaded_count += 1
    if EmotionDetector._model: loaded_count += 1
    if KeywordExtractor._nlp_fr: loaded_count += 1
    
    # Memory usage
    process = psutil.Process(os.getpid())
    memory_mb = process.memory_info().rss / 1024 / 1024
    
    return ReadyResponse(
        ready=True,
        models_loaded=loaded_count,
        memory_usage_mb=round(memory_mb, 2)
    )
