
from fastapi import APIRouter, Depends
from ...schemas.requests import LanguageDetectionRequest
from ...schemas.responses import LanguageResponse
from ...models.language_detector import LanguageDetector
from ...utils.preprocessing import TextPreprocessor
from ..dependencies import get_language_detector

router = APIRouter()

@router.post("/detect/language", response_model=LanguageResponse)
def detect_language(
    request: LanguageDetectionRequest,
    detector: LanguageDetector = Depends(get_language_detector)
):
    """
    Detect the language of the text using lightweight heuristics.
    """
    cleaned_text = TextPreprocessor.clean_text(request.text)
    result = detector.detect(cleaned_text)
    return LanguageResponse(**result)
