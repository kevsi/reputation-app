
from typing import Dict, List
import time
from langdetect import detect, detect_langs, LangDetectException
import structlog
from ..config.settings import settings

logger = structlog.get_logger()

class LanguageDetector:
    """
    Language detection using langdetect (lightweight library).
    """
    
    def __init__(self):
        # langdetect is library-based, no heavy model loading needed
        pass

    def detect(self, text: str) -> Dict:
        """
        Detects the language of the provided text.
        
        Returns:
            {
                "language": "fr",
                "confidence": 0.99,
                "alternatives": [...],
                "processing_time_ms": float
            }
        """
        start = time.time()
        
        try:
            # Main detection
            lang = detect(text)
            
            # Detailed probabilities
            probs = detect_langs(text)
            
            alternatives = [
                {"language": p.lang, "confidence": p.prob}
                for p in probs
            ]
            
            # Confidence of the top match
            confidence = alternatives[0]["confidence"] if alternatives else 0.0
            
        except LangDetectException:
            logger.warning("Language detection failed, defaulting to 'en'")
            lang = "en"
            confidence = 0.0
            alternatives = []
            
        processing_time = (time.time() - start) * 1000
        
        return {
            "language": lang,
            "confidence": confidence,
            "alternatives": alternatives,
            "processing_time_ms": round(processing_time, 2)
        }
