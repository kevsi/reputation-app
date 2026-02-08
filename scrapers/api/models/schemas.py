from pydantic import BaseModel, Field, HttpUrl, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================

class SourceType(str, Enum):
    GOOGLE_REVIEWS = "GOOGLE_REVIEWS"
    TRUSTPILOT = "TRUSTPILOT"
    TRIPADVISOR = "TRIPADVISOR"
    FACEBOOK = "FACEBOOK"
    TWITTER = "TWITTER"
    INSTAGRAM = "INSTAGRAM"
    NEWS = "NEWS"
    RSS = "RSS"
    REDDIT = "REDDIT"
    YOUTUBE = "YOUTUBE"

# ==================== BASE MODELS ====================

class ScrapedItem(BaseModel):
    """Item scraped standard"""
    externalId: str = Field(..., description="ID unique de la source externe")
    content: str = Field(..., min_length=1, description="Contenu textuel")
    author: Optional[str] = Field(None, description="Nom de l'auteur")
    authorAvatar: Optional[HttpUrl] = Field(None, description="Avatar de l'auteur")
    publishedAt: datetime = Field(..., description="Date de publication")
    url: Optional[HttpUrl] = Field(None, description="URL de la mention")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Métadonnées additionnelles")
    
    class Config:
        json_schema_extra = {
            "example": {
                "externalId": "google_ChIJ123_1234567890_John Doe",
                "content": "Excellent restaurant, service impeccable !",
                "author": "John Doe",
                "authorAvatar": "https://example.com/avatar.jpg",
                "publishedAt": "2024-01-15T10:30:00Z",
                "url": "https://maps.google.com/review/123",
                "metadata": {
                    "rating": 5,
                    "language": "fr"
                }
            }
        }

class ScraperResponse(BaseModel):
    """Réponse standard d'un scraper"""
    success: bool
    data: List[ScrapedItem]
    errors: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": [],
                "errors": [],
                "metadata": {
                    "totalFound": 10,
                    "scraped": 10,
                    "duplicates": 0,
                    "duration": 2.5
                }
            }
        }

# ==================== REQUEST MODELS ====================

class GoogleReviewsRequest(BaseModel):
    placeId: str = Field(..., min_length=10, description="Google Place ID")
    googleApiKey: str = Field(..., min_length=20, description="Google API Key")
    maxResults: int = Field(50, ge=1, le=500, description="Nombre max de résultats")

class TrustpilotRequest(BaseModel):
    companyUrl: HttpUrl = Field(..., description="URL de l'entreprise sur Trustpilot")
    maxPages: int = Field(5, ge=1, le=50, description="Nombre max de pages")

class TripAdvisorRequest(BaseModel):
    locationId: str = Field(..., min_length=5, description="TripAdvisor Location ID")
    maxPages: int = Field(5, ge=1, le=50, description="Nombre max de pages")

class FacebookRequest(BaseModel):
    pageId: str = Field(..., min_length=5, description="Facebook Page ID")
    accessToken: str = Field(..., min_length=20, description="Facebook Access Token")
    maxResults: int = Field(50, ge=1, le=100, description="Nombre max de résultats")

class TwitterRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=1, description="Username Twitter")
    hashtags: Optional[List[str]] = Field(None, description="Liste de hashtags")
    twitterBearerToken: str = Field(..., min_length=20, description="Twitter Bearer Token")
    maxResults: int = Field(50, ge=1, le=100, description="Nombre max de résultats")
    
    @validator('username', 'hashtags')
    def at_least_one(cls, v, values):
        if not v and not values.get('hashtags'):
            raise ValueError('username ou hashtags requis')
        return v

class RedditRequest(BaseModel):
    subreddits: List[str] = Field(..., min_items=1, description="Liste de subreddits")
    redditClientId: str = Field(..., min_length=10, description="Reddit Client ID")
    redditClientSecret: str = Field(..., min_length=10, description="Reddit Client Secret")
    maxResults: int = Field(50, ge=1, le=100, description="Nombre max de résultats")

class NewsRequest(BaseModel):
    keywords: List[str] = Field(..., min_items=1, description="Mots-clés de recherche")
    language: str = Field("fr", min_length=2, max_length=2, description="Code langue ISO 639-1")
    newsApiKey: str = Field(..., min_length=20, description="News API Key")
    maxResults: int = Field(50, ge=1, le=100, description="Nombre max de résultats")

class RSSRequest(BaseModel):
    feedUrl: HttpUrl = Field(..., description="URL du flux RSS")

class YouTubeRequest(BaseModel):
    channelId: Optional[str] = Field(None, min_length=5, description="YouTube Channel ID")
    videoId: Optional[str] = Field(None, min_length=5, description="YouTube Video ID")
    youtubeApiKey: str = Field(..., min_length=20, description="YouTube API Key")
    maxResults: int = Field(50, ge=1, le=100, description="Nombre max de résultats")
    
    @validator('channelId', 'videoId')
    def at_least_one(cls, v, values):
        if not v and not values.get('videoId') and not values.get('channelId'):
            raise ValueError('channelId ou videoId requis')
        return v
