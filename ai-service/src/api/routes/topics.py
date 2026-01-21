
from fastapi import APIRouter, Depends
from ...schemas.requests import TopicRequest
from ...schemas.responses import TopicResponse
from ...models.topic_analyzer import TopicAnalyzer
from ...utils.preprocessing import TextPreprocessor
from ..dependencies import get_topic_analyzer

router = APIRouter()

@router.post("/analyze/topics", response_model=TopicResponse)
def analyze_topics(
    request: TopicRequest,
    analyzer: TopicAnalyzer = Depends(get_topic_analyzer)
):
    """
    Analyze topics from a list of texts (using N-grams).
    """
    cleaned_texts = [TextPreprocessor.clean_text(t) for t in request.texts]
    result = analyzer.analyze(cleaned_texts, num_topics=request.num_topics)
    return TopicResponse(**result)
