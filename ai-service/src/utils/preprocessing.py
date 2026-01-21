
import re
import html
from typing import Optional
from ..config.settings import settings

class TextPreprocessor:
    """Utility class for cleaning text before analysis."""

    @staticmethod
    def clean_text(text: str, language: Optional[str] = None) -> str:
        """
        Cleans the input text based on configuration settings.
        
        Args:
            text: Raw input text
            language: Optional language code (can affect specific cleaning rules)
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""

        # Remove HTML tags
        text = html.unescape(text)
        text = re.sub(r'<[^>]+>', ' ', text)

        # Remove URLs if configured
        if settings.REMOVE_URLS:
            text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)

        # Basic whitespace cleanup
        text = re.sub(r'\s+', ' ', text).strip()

        # Remove hashtags and mentions (optional, good for sentiment)
        # text = re.sub(r'@[A-Za-z0-9_]+', '', text) # Remove mentions
        # text = re.sub(r'#[A-Za-z0-9_]+', '', text) # Remove hashtags

        # Truncate if too long (sanity check, usually handled by Pydantic)
        if len(text) > settings.MAX_TEXT_LENGTH:
            text = text[:settings.MAX_TEXT_LENGTH]

        return text

    @staticmethod
    def normalize_language_code(lang_code: str) -> str:
        """Normalizes language codes (e.g. 'fr-FR' -> 'fr')."""
        if not lang_code:
            return "en" # Default fallback
        return lang_code.split('-')[0].lower()
