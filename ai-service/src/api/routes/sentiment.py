
from fastapi import APIRouter, Depends
from ...schemas.requests import SentimentRequest
from ...schemas.responses import SentimentResponse
from ...models.sentiment_analyzer import SentimentAnalyzer
from ...utils.preprocessing import TextPreprocessor
from ..dependencies import get_sentiment_analyzer
import hashlib
from ...utils.cache import simple_memory_cache

router = APIRouter()

@simple_memory_cache()
def _analyze_cached(text: str, analyzer: SentimentAnalyzer):
    # Helper to cache logic if needed, but simple_memory_cache wraps function calls.
    # Since we can't easily cache async route handlers or pass complex objects to lru_cache key,
    # we usually cache the model method or a service function.
    # For this project, we'll cache at the service/model level or here if inputs are simple.
    return analyzer.analyze(text)


@router.post("/analyze/sentiment", response_model=SentimentResponse)
def analyze_sentiment(
    request: SentimentRequest,
    analyzer: SentimentAnalyzer = Depends(get_sentiment_analyzer)
):
    """
    Analyze sentiment of the given text.
    Categories: POSITIVE, NEGATIVE, NEUTRAL, MIXED.
    """
    cleaned_text = TextPreprocessor.clean_text(request.text)
    
    result = analyzer.analyze(cleaned_text)
    
    # Add manual language override if provided (though model is multilingual)
    if request.language:
        result["language_detected"] = request.language
        
    return SentimentResponse(**result)
