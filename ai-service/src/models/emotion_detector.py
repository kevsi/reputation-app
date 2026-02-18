
from transformers import pipeline
from typing import Dict
import time
import structlog
from ..config.settings import settings
from ..utils.exceptions import ModelLoadException
from .model_state import set_emotion_loaded

logger = structlog.get_logger()

logger = structlog.get_logger()

class EmotionDetector:
    """Emotion Detection using Transformers."""
    
    _instance = None
    _model = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmotionDetector, cls).__new__(cls)
        return cls._instance

    def initialize(self):
        if not self.__class__._initialized:
            try:
                logger.info("Loading Emotion Model...", model=settings.EMOTION_MODEL)
                device = 0 if settings.USE_GPU else -1
                self.__class__._model = pipeline(
                    "text-classification",
                    model=settings.EMOTION_MODEL,
                    device=device,
                    top_k=None
                )
                self.__class__._initialized = True
                set_emotion_loaded(True)
                logger.info("Emotion Model loaded successfully")
            except Exception as e:
                logger.error("Failed to load emotion model", error=str(e))
                raise ModelLoadException("EmotionDetector", str(e))

    def analyze(self, text: str) -> Dict:
        if not self.__class__._initialized:
            self.initialize()

        start = time.time()
        truncated_text = text[:2000]

        try:
            results = self.__class__._model(truncated_text)[0]
            # results: [{'label': 'joy', 'score': 0.9}, {'label': 'anger', 'score': 0.05}, ...]
            
            emotions_map = {item['label']: item['score'] for item in results}
            
            # Ensure all Ekman emotions are present
            base_emotions = ["anger", "joy", "sadness", "fear", "surprise", "disgust", "neutral"]
            scores = {emo: round(emotions_map.get(emo, 0.0), 3) for emo in base_emotions}
            
            # Find dominant
            dominant = max(scores, key=scores.get)
            
            processing_time = (time.time() - start) * 1000
            
            return {
                "emotions": scores,
                "dominant_emotion": dominant,
                "processing_time_ms": round(processing_time, 2)
            }
            
        except Exception as e:
            logger.error("Error during emotion analysis", error=str(e))
            raise e
