
from transformers import pipeline
from typing import Dict, Literal, List
import time
import structlog
from ..config.settings import settings
from ..utils.exceptions import ModelLoadException
from .model_state import set_sentiment_loaded

logger = structlog.get_logger()

logger = structlog.get_logger()

class SentimentAnalyzer:
    """Multilingual Sentiment Analysis using Transformers."""
    
    _instance = None
    _model = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SentimentAnalyzer, cls).__new__(cls)
        return cls._instance

    def initialize(self):
        """Lazy loading of the model."""
        if not self.__class__._initialized:
            try:
                logger.info("Loading Sentiment Model...", model=settings.SENTIMENT_MODEL)
                device = 0 if settings.USE_GPU else -1
                self.__class__._model = pipeline(
                    "sentiment-analysis",
                    model=settings.SENTIMENT_MODEL,
                    device=device,
                    top_k=None # Return all scores
                )
                self.__class__._initialized = True
                set_sentiment_loaded(True)
                logger.info("Sentiment Model loaded successfully")
            except Exception as e:
                logger.error("Failed to load sentiment model", error=str(e))
                raise ModelLoadException("SentimentAnalyzer", str(e))

    def analyze(self, text: str) -> Dict:
        """
        Analyzes the sentiment of a text.
        """
        if not self.__class__._initialized:
            self.initialize()

        start = time.time()
        
        # Truncate text to model's max length (usually 512 tokens)
        # We approximate tokens by chars for speed if needed, but pipeline handles truncation often.
        # Explicit truncation is safer for long texts.
        truncated_text = text[:2000] 

        try:
            # Result is a list of lists because top_k=None and we pass a single string
            results = self.__class__._model(truncated_text)
            # results looks like: [[{'label': '5 stars', 'score': 0.8}, {'label': '4 stars', ...}]]
            scores_list = results[0] # First sentence results
            
            # Normalize scores based on model type
            formatted_scores = self._normalize_scores(scores_list)
            
            sentiment_label = self._determine_sentiment_label(formatted_scores)
            
            processing_time = (time.time() - start) * 1000
            
            return {
                "sentiment": sentiment_label,
                "confidence": formatted_scores.get("max_score", 0.0), # Highest score
                "scores": {
                    "positive": formatted_scores["positive"],
                    "negative": formatted_scores["negative"],
                    "neutral": formatted_scores["neutral"]
                },
                "processing_time_ms": round(processing_time, 2)
            }
            
        except Exception as e:
            logger.error("Error during sentiment analysis", error=str(e))
            # Return neutral fallback in worst case
            return {
                "sentiment": "NEUTRAL",
                "confidence": 0.0,
                "scores": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
                "processing_time_ms": 0.0
            }

    def _normalize_scores(self, scores_list: List[Dict]) -> Dict:
        """Maps model specific labels (stars) to positive/negative/neutral."""
        # nlptown/bert-base-multilingual-uncased-sentiment uses '1 star' to '5 stars'
        
        pos_score = 0.0
        neg_score = 0.0
        neu_score = 0.0
        
        for item in scores_list:
            label = item['label']
            score = item['score']
            
            if label in ['5 stars', '4 stars']:
                pos_score += score
            elif label in ['1 star', '2 stars']:
                neg_score += score
            elif label == '3 stars':
                neu_score += score
        
        # Normalize to sum up to 1 (approx)
        total = pos_score + neg_score + neu_score
        if total > 0:
            pos_score /= total
            neg_score /= total
            neu_score /= total
            
        return {
            "positive": round(pos_score, 4),
            "negative": round(neg_score, 4),
            "neutral": round(neu_score, 4),
            "max_score": max(pos_score, neg_score, neu_score)
        }

    def _determine_sentiment_label(self, scores: Dict) -> Literal["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"]:
        pos = scores["positive"]
        neg = scores["negative"]
        neu = scores["neutral"]
        
        # Logic described in specs
        if pos > 0.6:
            return "POSITIVE"
        if neg > 0.6: # Adjusted threshold from specs to be symmetric, user said < -0.2 score but here we have probabilities 0-1
             return "NEGATIVE"
             
        # Detect Mixed: both pos and neg are significant
        if pos > 0.25 and neg > 0.25:
            return "MIXED"
            
        return "NEUTRAL"
