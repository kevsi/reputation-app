
from pydantic import BaseModel
from typing import Dict, List, Optional, Literal

class BaseResponse(BaseModel):
    processing_time_ms: float

class SentimentScores(BaseModel):
    positive: float
    negative: float
    neutral: float

class SentimentResponse(BaseResponse):
    sentiment: Literal["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"]
    confidence: float
    scores: SentimentScores
    language_detected: Optional[str] = None

class EmotionScores(BaseModel):
    anger: float
    joy: float
    sadness: float
    fear: float
    surprise: float
    disgust: float
    neutral: float = 0.0 # Sometimes useful

class EmotionResponse(BaseResponse):
    emotions: EmotionScores
    dominant_emotion: str

class KeywordItem(BaseModel):
    word: str
    score: float
    category: Optional[str] = "UNKNOWN"

class KeywordResponse(BaseResponse):
    keywords: List[KeywordItem]

class TopicItem(BaseModel):
    id: int
    label: str
    keywords: List[str]
    text_count: int

class TopicResponse(BaseResponse):
    topics: List[TopicItem]

class LanguageAlternative(BaseModel):
    language: str
    confidence: float

class LanguageResponse(BaseResponse):
    language: str
    confidence: float
    alternatives: List[LanguageAlternative]

class HealthResponse(BaseModel):
    status: str
    version: str
    models_loaded: Dict[str, bool]
    uptime_seconds: float

class ReadyResponse(BaseModel):
    ready: bool
    models_loaded: int
    memory_usage_mb: float
