
import yake
import spacy
from typing import List, Dict
import time
import structlog
from ..utils.exceptions import ModelLoadException
from .model_state import set_keyword_loaded

logger = structlog.get_logger()

logger = structlog.get_logger()

class KeywordExtractor:
    """
    Keyword Extraction using YAKE (Statistical/Lightweight) + Spacy for Named Entities (NER).
    """
    
    _instance = None
    _nlp_fr = None
    _nlp_en = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(KeywordExtractor, cls).__new__(cls)
        return cls._instance

    def initialize(self):
        if not self.__class__._initialized:
            try:
                logger.info("Loading SpaCy models...")
                # Assuming models are downloaded in Dockerfile
                import fr_core_news_sm
                import en_core_web_sm
                self.__class__._nlp_fr = fr_core_news_sm.load()
                self.__class__._nlp_en = en_core_web_sm.load()
                self.__class__._initialized = True
                set_keyword_loaded(True)
                logger.info("SpaCy models loaded.")
            except ImportError as e:
                logger.error("SpaCy models not found", error=str(e))
                raise ModelLoadException("KeywordExtractor", "SpaCy models not found. Run 'python -m spacy download fr_core_news_sm'")

    def _get_nlp_model(self, lang: str):
        if lang == 'fr':
            return self.__class__._nlp_fr
        return self.__class__._nlp_en # Default to English

    def extract(self, text: str, max_keywords: int = 10, lang: str = "fr") -> Dict:
        if not self.__class__._initialized:
            self.initialize()

        start = time.time()
        keywords_list = []
        
        try:
            # 1. Spacy NER (Named Entity Recognition) - High Quality
            nlp = self._get_nlp_model(lang)
            doc = nlp(text)
            
            seen_words = set()
            
            # Categories mapping
            label_map = {
                "ORG": "ORGANIZATION",
                "PER": "PERSON",
                "LOC": "LOCATION",
                "GPE": "LOCATION",
                "PRODUCT": "PRODUCT"
            }

            for ent in doc.ents:
                if ent.text.lower() not in seen_words and ent.label_ in label_map:
                    keywords_list.append({
                        "word": ent.text,
                        "score": 1.0, # High confidence for NER
                        "category": label_map.get(ent.label_, "ENTITY")
                    })
                    seen_words.add(ent.text.lower())

            # 2. YAKE Extraction (Statistical) - Good for general topics
            # YAKE configuration
            kw_extractor = yake.KeywordExtractor(
                lan=lang, 
                n=2,              # Bigrams max
                dedupLim=0.9, 
                top=max_keywords, 
                features=None
            )
            
            yake_keywords = kw_extractor.extract_keywords(text)
            
            for kw, score in yake_keywords:
                # YAKE returns lower score -> better relevance. We invert it for consistency (0 to 1)
                # Typical YAKE score is 0.01 (good) to >1 (bad).
                relevance = max(0.0, 1.0 - score) if score < 1.0 else 0.1
                
                if kw.lower() not in seen_words:
                    keywords_list.append({
                        "word": kw,
                        "score": round(relevance, 2),
                        "category": "TOPIC"
                    })
                    seen_words.add(kw.lower())

            # Sort by score descending and limit
            keywords_list.sort(key=lambda x: x['score'], reverse=True)
            keywords_list = keywords_list[:max_keywords]

            processing_time = (time.time() - start) * 1000
            
            return {
                "keywords": keywords_list,
                "processing_time_ms": round(processing_time, 2)
            }

        except Exception as e:
            logger.error("Error during keyword extraction", error=str(e))
            return {"keywords": [], "processing_time_ms": 0.0}
