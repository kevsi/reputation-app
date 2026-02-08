from fastapi import APIRouter, HTTPException, status
from loguru import logger
from datetime import datetime
from bs4 import BeautifulSoup
import httpx
from typing import List
import hashlib
import asyncio

from ..models.schemas import TrustpilotRequest, ScraperResponse, ScrapedItem
from ..config import settings
from ..utils.rate_limiter import rate_limit

router = APIRouter()

@router.post("/trustpilot", response_model=ScraperResponse)
@rate_limit(calls=5, period=60)  # 5 calls par minute (Trustpilot est strict)
async def scrape_trustpilot(request: TrustpilotRequest) -> ScraperResponse:
    """
    Scraper Trustpilot via scraping HTML (pas d'API officielle)
    
    Args:
        request: Configuration du scraping
    
    Returns:
        ScraperResponse avec les avis collectés
    """
    logger.info(f"Starting Trustpilot scraping for: {request.companyUrl}")
    
    start_time = datetime.now()
    scraped_items: List[ScrapedItem] = []
    errors: List[str] = []
    
    # Headers pour simuler un navigateur
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        async with httpx.AsyncClient(
            timeout=settings.http_timeout,
            headers=headers,
            follow_redirects=True
        ) as client:
            
            # Initialize loop variable
            page = 1
            for page in range(1, request.maxPages + 1):
                try:
                    # URL de la page
                    page_url = f"{request.companyUrl}?page={page}"
                    
                    logger.debug(f"Scraping page {page}: {page_url}")
                    
                    # Requête HTTP
                    response = await client.get(page_url)
                    response.raise_for_status()
                    
                    # Parser le HTML
                    soup = BeautifulSoup(response.text, 'lxml')
                    
                    # Sélecteurs CSS pour Trustpilot (à adapter si changements)
                    reviews = soup.select('article.paper_paper__1PY90.paper_outline__lwsUX.card_card__lQWDv')
                    
                    if not reviews:
                        logger.warning(f"No reviews found on page {page}")
                        break
                    
                    logger.info(f"Found {len(reviews)} reviews on page {page}")
                    
                    for review in reviews:
                        try:
                            # Extraction des données
                            author_elem = review.select_one('[data-consumer-name-typography="true"]')
                            author = author_elem.text.strip() if author_elem else 'Anonymous'
                            
                            content_elem = review.select_one('[data-service-review-text-typography="true"]')
                            content = content_elem.text.strip() if content_elem else ''
                            
                            date_elem = review.select_one('time')
                            date_str = date_elem.get('datetime') if date_elem else None
                            
                            rating_elem = review.select_one('[data-service-review-rating]')
                            rating = int(rating_elem.get('data-service-review-rating', 0)) if rating_elem else None
                            
                            verified_elem = review.select_one('[data-service-review-verified]')
                            verified = bool(verified_elem)
                            
                            # ID unique
                            unique_string = f"{request.companyUrl}_{author}_{date_str}"
                            external_id = f"trustpilot_{hashlib.md5(unique_string.encode()).hexdigest()}"
                            
                            # Date de publication
                            if date_str:
                                published_at = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                            else:
                                published_at = datetime.now()
                            
                            item = ScrapedItem(
                                externalId=external_id,
                                content=content,
                                author=author,
                                authorAvatar=None,  # Pas accessible facilement
                                publishedAt=published_at,
                                url=page_url,
                                metadata={
                                    'rating': rating,
                                    'platform': 'Trustpilot',
                                    'verified': verified,
                                    'page': page,
                                }
                            )
                            
                            scraped_items.append(item)
                            
                        except Exception as e:
                            error_msg = f"Failed to parse review on page {page}: {str(e)}"
                            logger.warning(error_msg)
                            errors.append(error_msg)
                            continue
                    
                    # Petit délai entre les pages pour éviter rate limit
                    if page < request.maxPages:
                        await asyncio.sleep(1)
                    
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429:
                        error_msg = "Rate limit atteint sur Trustpilot"
                        logger.error(error_msg)
                        errors.append(error_msg)
                        break
                    else:
                        raise
        
        duration = (datetime.now() - start_time).total_seconds()
        
        logger.success(
            f"Trustpilot scraping completed: {len(scraped_items)} items in {duration:.2f}s"
        )
        
        return ScraperResponse(
            success=True,
            data=scraped_items,
            errors=errors,
            metadata={
                'totalFound': len(scraped_items),
                'scraped': len(scraped_items),
                'duplicates': 0,
                'duration': duration,
                'pagesScraped': min(page, request.maxPages),
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
