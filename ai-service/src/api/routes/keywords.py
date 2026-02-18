
from fastapi import APIRouter, Depends
from ...schemas.requests import KeywordRequest
from ...schemas.responses import KeywordResponse
from ...models.keyword_extractor import KeywordExtractor
from ...utils.preprocessing import TextPreprocessor
from ..dependencies import get_keyword_extractor

router = APIRouter()

@router.post("/analyze/keywords", response_model=KeywordResponse)
def analyze_keywords(
    request: KeywordRequest,
    extractor: KeywordExtractor = Depends(get_keyword_extractor)
):
    """
    Extract keywords and named entities.
    """
    cleaned_text = TextPreprocessor.clean_text(request.text)
    
    # Use detected language or default to fr
    lang = request.language if request.language else "fr"
    
    result = extractor.extract(
        cleaned_text, 
        max_keywords=request.max_keywords,
        lang=lang
    )
    return KeywordResponse(**result)
