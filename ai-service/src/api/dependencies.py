
from functools import lru_cache
from ..models.sentiment_analyzer import SentimentAnalyzer
from ..models.emotion_detector import EmotionDetector
from ..models.keyword_extractor import KeywordExtractor
from ..models.topic_analyzer import TopicAnalyzer
from ..models.language_detector import LanguageDetector

# Singletons are handled within the classes themselves via __new__ or initialized here.
# For FastAPI dependencies, we can just return these instances.

@lru_cache()
def get_sentiment_analyzer() -> SentimentAnalyzer:
    return SentimentAnalyzer()

@lru_cache()
def get_emotion_detector() -> EmotionDetector:
    return EmotionDetector()

@lru_cache()
def get_keyword_extractor() -> KeywordExtractor:
    return KeywordExtractor()

@lru_cache()
def get_topic_analyzer() -> TopicAnalyzer:
    return TopicAnalyzer()

@lru_cache()
def get_language_detector() -> LanguageDetector:
    return LanguageDetector()
