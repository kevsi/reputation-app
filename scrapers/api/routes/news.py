from fastapi import APIRouter, HTTPException, status
from loguru import logger
from datetime import datetime
import httpx
from typing import List
import hashlib

from ..models.schemas import NewsRequest, ScraperResponse, ScrapedItem
from ..config import settings
from ..utils.rate_limiter import rate_limit

router = APIRouter()

@router.post("/news", response_model=ScraperResponse)
@rate_limit(calls=20, period=60)  # 20 calls par minute
async def scrape_news(request: NewsRequest) -> ScraperResponse:
    """
    Scraper News via NewsAPI (https://newsapi.org)
    
    Args:
        request: Configuration du scraping
    
    Returns:
        ScraperResponse avec les articles collectés
    """
    logger.info(f"Starting News scraping for keywords: {request.keywords}")
    
    start_time = datetime.now()
    scraped_items: List[ScrapedItem] = []
    errors: List[str] = []
    
    try:
        # Construire la query
        query = ' OR '.join(request.keywords)
        
        # Appel NewsAPI
        url = "https://newsapi.org/v2/everything"
        params = {
            'q': query,
            'language': request.language,
            'sortBy': 'publishedAt',
            'pageSize': min(request.maxResults, 100),  # Max 100 par page
            'apiKey': request.newsApiKey,
        }
        
        async with httpx.AsyncClient(timeout=settings.http_timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
        
        data = response.json()
        
        # Vérifier le statut
        if data.get('status') != 'ok':
            error_msg = f"NewsAPI error: {data.get('message', 'Unknown error')}"
            logger.error(error_msg)
            
            if data.get('code') == 'apiKeyInvalid':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="API Key invalide"
                )
            elif data.get('code') == 'rateLimited':
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit atteint"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_msg
                )
        
        articles = data.get('articles', [])
        total_results = data.get('totalResults', 0)
        
        logger.info(f"Found {len(articles)} articles (total available: {total_results})")
        
        # Transformer les articles
        for article in articles:
            try:
                # ID unique basé sur URL
                url_hash = hashlib.md5(article['url'].encode()).hexdigest()
                external_id = f"news_{url_hash}"
                
                # Contenu : titre + description
                content_parts = []
                if article.get('title'):
                    content_parts.append(article['title'])
                if article.get('description'):
                    content_parts.append(article['description'])
                content = '. '.join(content_parts)
                
                # Date de publication
                published_at_str = article.get('publishedAt')
                if published_at_str:
                    published_at = datetime.fromisoformat(published_at_str.replace('Z', '+00:00'))
                else:
                    published_at = datetime.now()
                
                item = ScrapedItem(
                    externalId=external_id,
                    content=content,
                    author=article.get('author', 'Unknown'),
                    authorAvatar=None,
                    publishedAt=published_at,
                    url=article.get('url'),
                    metadata={
                        'source': article.get('source', {}).get('name'),
                        'title': article.get('title'),
                        'description': article.get('description'),
                        'image': article.get('urlToImage'),
                        'content_preview': article.get('content', '')[:200],
                    }
                )
                
                scraped_items.append(item)
                
            except Exception as e:
                error_msg = f"Failed to parse article: {str(e)}"
                logger.warning(error_msg)
                errors.append(error_msg)
                continue
        
        duration = (datetime.now() - start_time).total_seconds()
        
        logger.success(
            f"News scraping completed: {len(scraped_items)} items in {duration:.2f}s"
        )
        
        return ScraperResponse(
            success=True,
            data=scraped_items,
            errors=errors,
            metadata={
                'totalFound': total_results,
                'scraped': len(scraped_items),
                'duplicates': 0,
                'duration': duration,
                'keywords': request.keywords,
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
