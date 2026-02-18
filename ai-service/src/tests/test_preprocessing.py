
import pytest
from ..utils.preprocessing import TextPreprocessor

def test_clean_text_basic():
    raw_text = "   Hello   World!   "
    expected = "Hello World!"
    assert TextPreprocessor.clean_text(raw_text) == expected

def test_clean_text_html():
    raw_text = "<p>This is <b>bold</b></p>"
    expected = "This is bold"
    assert TextPreprocessor.clean_text(raw_text) == expected

def test_clean_text_basic_url():
    # Assuming REMOVE_URLS is True by default in settings or mock it
    raw_text = "Check this http://example.com link"
    expected = "Check this link"
    assert TextPreprocessor.clean_text(raw_text) == expected

def test_clean_empty():
    assert TextPreprocessor.clean_text("") == ""
    assert TextPreprocessor.clean_text(None) == ""
