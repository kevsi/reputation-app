
from fastapi import APIRouter, Depends
from ...schemas.requests import EmotionRequest
from ...schemas.responses import EmotionResponse
from ...models.emotion_detector import EmotionDetector
from ...utils.preprocessing import TextPreprocessor
from ..dependencies import get_emotion_detector

router = APIRouter()

@router.post("/analyze/emotions", response_model=EmotionResponse)
def analyze_emotions(
    request: EmotionRequest,
    detector: EmotionDetector = Depends(get_emotion_detector)
):
    """
    Analyze emotions (Ekman: anger, joy, sadness, fear, surprise, disgust).
    """
    cleaned_text = TextPreprocessor.clean_text(request.text)
    result = detector.analyze(cleaned_text)
    return EmotionResponse(**result)
