
from typing import List, Dict
from sklearn.feature_extraction.text import CountVectorizer
import time
import structlog

logger = structlog.get_logger()

class TopicAnalyzer:
    """
    Topic Analysis V1: Simple N-gram clustering / Frequency analysis.
    User opted for lightweight N-gram approach for V1.
    """
    
    def analyze(self, texts: List[str], num_topics: int = 5) -> Dict:
        """
        Extracts common topics (frequent n-grams) from a list of texts.
        Acts as a 'trending topics' analyzer.
        """
        start = time.time()
        
        try:
            # Use CountVectorizer to find frequent bi-grams and tri-grams
            # Stop words handling would be good here, relying on simple 'english'/'french' list
            # Since we iterate generic 'texts', we assume mixed or dominant language.
            
            vectorizer = CountVectorizer(
                ngram_range=(2, 3), # Bi-grams and Tri-grams
                max_df=0.95,        # Ignore terms appearing in > 95% of docs
                min_df=2,           # Ignore terms appearing in < 2 docs
                max_features=num_topics * 2,
                stop_words='english' # Ideally dynamic, but fixed for V1 simplicity
            )
            
            # If not enough text for vectorizer, fallback
            try:
                X = vectorizer.fit_transform(texts)
                vocab = vectorizer.vocabulary_
                # Sort by frequency
                sum_words = X.sum(axis=0) 
                words_freq = [(word, sum_words[0, idx]) for word, idx in vocab.items()]
                words_freq = sorted(words_freq, key = lambda x: x[1], reverse=True)
                
                topics = []
                for i, (phrase, count) in enumerate(words_freq[:num_topics]):
                    topics.append({
                        "id": i,
                        "label": phrase.title(),
                        "keywords": phrase.split(),
                        "text_count": int(count)
                    })
                    
            except ValueError:
                # E.g. empty vocabulary or everything filtered out
                logger.warning("Topic analysis: Not enough data for vectorizer")
                topics = []

            processing_time = (time.time() - start) * 1000
            
            return {
                "topics": topics,
                "processing_time_ms": round(processing_time, 2)
            }
            
        except Exception as e:
            logger.error("Error during topic analysis", error=str(e))
            return {"topics": [], "processing_time_ms": 0.0}
