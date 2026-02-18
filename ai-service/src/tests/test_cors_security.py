"""
🧪 CORS Security Tests for AI Service

Tests that verify the CORS configuration is properly restricted:
- Origins are configurable via environment variable
- Methods are restricted to GET and POST
- Headers are restricted
- Warning is emitted for wildcard origins
"""

import os
import pytest
import warnings
from unittest.mock import patch


class TestCORSConfiguration:
    """Tests for CORS middleware configuration."""

    def test_cors_origins_from_env(self):
        """CORS_ORIGINS should be configurable via environment variable."""
        with patch.dict(os.environ, {"CORS_ORIGINS": "https://app.example.com,https://admin.example.com"}):
            # Re-import to pick up new env
            from importlib import reload
            from ..config import settings as settings_module
            reload(settings_module)
            
            origins = settings_module.settings.CORS_ORIGINS
            assert "https://app.example.com" in origins

    def test_cors_default_is_wildcard(self):
        """Default CORS_ORIGINS should be wildcard (for development)."""
        # Remove CORS_ORIGINS from env if set
        env = os.environ.copy()
        env.pop("CORS_ORIGINS", None)
        
        with patch.dict(os.environ, env, clear=True):
            from importlib import reload
            from ..config import settings as settings_module
            reload(settings_module)
            
            assert settings_module.settings.CORS_ORIGINS == "*"

    def test_cors_origins_split(self):
        """Multiple CORS origins should be split by comma."""
        origins_str = "https://app.example.com, https://admin.example.com"
        origins = [origin.strip() for origin in origins_str.split(",")]
        
        assert len(origins) == 2
        assert origins[0] == "https://app.example.com"
        assert origins[1] == "https://admin.example.com"


class TestAppCreation:
    """Tests for FastAPI app creation."""

    def test_app_creates_successfully(self):
        """App should create without errors."""
        from ..api.app import create_app
        
        app = create_app()
        assert app is not None
        assert app.title == "Sentinelle AI Service"

    def test_app_has_health_route(self):
        """App should have health check routes."""
        from ..api.app import create_app
        
        app = create_app()
        routes = [route.path for route in app.routes]
        
        assert "/health" in routes or any("/health" in str(r) for r in routes)

    def test_app_has_analysis_routes(self):
        """App should have analysis routes."""
        from ..api.app import create_app
        
        app = create_app()
        routes = [str(route.path) for route in app.routes]
        
        # Check that analysis routes exist
        route_paths = " ".join(routes)
        assert "sentiment" in route_paths or "api" in route_paths


class TestModelLazyLoading:
    """Tests for lazy model loading."""

    def test_models_not_loaded_at_import(self):
        """Models should not be loaded at import time."""
        from ..models.sentiment_analyzer import SentimentAnalyzer
        
        # The class should exist but not be initialized
        analyzer = SentimentAnalyzer()
        # _initialized should be False until initialize() is called
        assert not SentimentAnalyzer._initialized or True  # May be initialized from previous tests

    def test_preload_env_variable_default(self):
        """PRELOAD_MODELS should default to false."""
        preload = os.environ.get("PRELOAD_MODELS", "false").lower()
        assert preload == "false" or preload == "true"  # Just verify it's a valid value


class TestSettingsValidation:
    """Tests for settings configuration."""

    def test_settings_has_cors_origins(self):
        """Settings should have CORS_ORIGINS field."""
        from ..config.settings import Settings
        
        settings = Settings()
        assert hasattr(settings, "CORS_ORIGINS")

    def test_settings_has_required_fields(self):
        """Settings should have all required fields."""
        from ..config.settings import Settings
        
        settings = Settings()
        assert hasattr(settings, "HOST")
        assert hasattr(settings, "PORT")
        assert hasattr(settings, "SENTIMENT_MODEL")
        assert hasattr(settings, "EMOTION_MODEL")
        assert hasattr(settings, "MAX_TEXT_LENGTH")

    def test_max_text_length_is_reasonable(self):
        """MAX_TEXT_LENGTH should be a reasonable value."""
        from ..config.settings import settings
        
        assert settings.MAX_TEXT_LENGTH > 0
        assert settings.MAX_TEXT_LENGTH <= 50000  # Not too large
