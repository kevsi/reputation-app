from fastapi import APIRouter, HTTPException, status
from loguru import logger
from datetime import datetime
import httpx
from typing import List
import hashlib

from ..models.schemas import GoogleReviewsRequest, ScraperResponse, ScrapedItem
from ..config import settings
from ..utils.rate_limiter import rate_limit

router = APIRouter()

@router.post("/google-reviews", response_model=ScraperResponse)
@rate_limit(calls=10, period=60)  # 10 calls par minute
async def scrape_google_reviews(request: GoogleReviewsRequest) -> ScraperResponse:
    """
    Scraper Google Reviews via Google Places API
    
    Args:
        request: Configuration du scraping
    
    Returns:
        ScraperResponse avec les avis collectés
    
    Raises:
        HTTPException: En cas d'erreur API ou de rate limit
    """
    logger.info(f"Starting Google Reviews scraping for placeId: {request.placeId}")
    
    start_time = datetime.now()
    scraped_items: List[ScrapedItem] = []
    errors: List[str] = []
    
    try:
        # Appel Google Places API
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            'place_id': request.placeId,
            'fields': 'reviews,name,rating,user_ratings_total',
            'key': request.googleApiKey,
            'language': 'fr',  # Optionnel : adapter selon besoin
        }
        
        async with httpx.AsyncClient(timeout=settings.http_timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
        
        data = response.json()
        
        # Vérifier le statut de la réponse
        if data.get('status') != 'OK':
            error_msg = f"Google API error: {data.get('status')} - {data.get('error_message', 'Unknown error')}"
            logger.error(error_msg)
            
            # Gérer les erreurs spécifiques
            if data.get('status') == 'REQUEST_DENIED':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="API Key invalide ou permissions insuffisantes"
                )
            elif data.get('status') == 'INVALID_REQUEST':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Place ID invalide"
                )
            elif data.get('status') == 'OVER_QUERY_LIMIT':
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Quota Google API dépassé"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_msg
                )
        
        result = data.get('result', {})
        reviews = result.get('reviews', [])
        place_name = result.get('name', 'Unknown Place')
        
        logger.info(f"Found {len(reviews)} reviews for {place_name}")
        
        # Transformer les avis en format standard
        for review in reviews[:request.maxResults]:
            try:
                # Créer un ID unique basé sur place_id + author + timestamp
                unique_string = f"{request.placeId}_{review.get('author_name', 'Anonymous')}_{review['time']}"
                external_id = f"google_{hashlib.md5(unique_string.encode()).hexdigest()}"
                
                # Convertir timestamp Unix en datetime ISO
                published_at = datetime.fromtimestamp(review['time'])
                
                item = ScrapedItem(
                    externalId=external_id,
                    content=review.get('text', ''),
                    author=review.get('author_name', 'Anonymous'),
                    authorAvatar=review.get('profile_photo_url'),
                    publishedAt=published_at,
                    url=review.get('author_url', ''),
                    metadata={
                        'rating': review.get('rating'),
                        'language': review.get('language'),
                        'relative_time': review.get('relative_time_description'),
                        'place_name': place_name,
                        'place_rating': result.get('rating'),
                        'total_ratings': result.get('user_ratings_total'),
                    }
                )
                
                scraped_items.append(item)
                
            except Exception as e:
                error_msg = f"Failed to parse review: {str(e)}"
                logger.warning(error_msg)
                errors.append(error_msg)
                continue
        
        duration = (datetime.now() - start_time).total_seconds()
        
        logger.success(
            f"Google Reviews scraping completed: {len(scraped_items)} items in {duration:.2f}s"
        )
        
        return ScraperResponse(
            success=True,
            data=scraped_items,
            errors=errors,
            metadata={
                'totalFound': len(reviews),
                'scraped': len(scraped_items),
                'duplicates': 0,
                'duration': duration,
                'placeName': place_name,
            }
        )
        
    except httpx.HTTPError as e:
        error_msg = f"HTTP error: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_msg
        )
    
    except Exception as e:
        error_msg = f"Scraping failed: {str(e)}"
        logger.exception(error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )
