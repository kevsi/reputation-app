
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from ..config.settings import settings

class AnalyzeRequest(BaseModel):
    """Base schema for analysis requests."""
    text: str = Field(..., min_length=1, max_length=settings.MAX_TEXT_LENGTH, description="Text to analyze")
    language: Optional[str] = Field(None, description="Language code (fr, en, es). Auto-detected if empty.")

    @field_validator('text')
    def text_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Text must not be empty')
        return v

class SentimentRequest(AnalyzeRequest):
    pass

class EmotionRequest(AnalyzeRequest):
    pass

class KeywordRequest(AnalyzeRequest):
    max_keywords: int = Field(10, ge=1, le=50, description="Maximum number of keywords to return")

class TopicRequest(BaseModel):
    texts: List[str] = Field(..., min_length=2, max_length=1000, description="List of texts to analyze")
    num_topics: int = Field(5, ge=2, le=20, description="Number of topics to find (if applicable)")

    @field_validator('texts')
    def validate_texts(cls, v):
        if len(v) < 2:
            raise ValueError('At least 2 texts are required for topic analysis')
        cleaned_texts = [t for t in v if t.strip()]
        if len(cleaned_texts) < 2:
             raise ValueError('At least 2 non-empty texts are required')
        return cleaned_texts

class LanguageDetectionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=settings.MAX_TEXT_LENGTH)
