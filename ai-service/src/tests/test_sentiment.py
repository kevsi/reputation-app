
import pytest
from ..models.sentiment_analyzer import SentimentAnalyzer

# Mock the pipeline to avoid downloading models during tests if possible,
# or use unit tests that don't rely on the heavy model logic.
# For integration tests, we can use the real model.

@pytest.fixture
def analyzer():
    return SentimentAnalyzer()

def test_map_sentiment_positive(analyzer):
    # Test internal mapping method
    scores = {"positive": 0.8, "negative": 0.1, "neutral": 0.1}
    assert analyzer._determine_sentiment_label(scores) == "POSITIVE"

def test_map_sentiment_negative(analyzer):
    scores = {"positive": 0.1, "negative": 0.8, "neutral": 0.1}
    assert analyzer._determine_sentiment_label(scores) == "NEGATIVE"

def test_map_sentiment_neutral(analyzer):
    scores = {"positive": 0.1, "negative": 0.1, "neutral": 0.8}
    assert analyzer._determine_sentiment_label(scores) == "NEUTRAL"
