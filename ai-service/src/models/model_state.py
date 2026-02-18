# Global model state
sentiment_model_loaded = False
emotion_model_loaded = False
keyword_model_loaded = False

def set_sentiment_loaded(loaded: bool):
    global sentiment_model_loaded
    sentiment_model_loaded = loaded

def set_emotion_loaded(loaded: bool):
    global emotion_model_loaded
    emotion_model_loaded = loaded

def set_keyword_loaded(loaded: bool):
    global keyword_model_loaded
    keyword_model_loaded = loaded

def get_models_status():
    return {
        "sentiment": sentiment_model_loaded,
        "emotions": emotion_model_loaded,
        "keywords": keyword_model_loaded
    }