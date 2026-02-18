from fastapi import APIRouter, HTTPException, status
from loguru import logger
from ..models.schemas import RSSRequest, ScraperResponse
from ..utils.rate_limiter import rate_limit

router = APIRouter()

@router.post("/rss", response_model=ScraperResponse)
@rate_limit(calls=5, period=60)
async def scrape_rss(request: RSSRequest) -> ScraperResponse:
    logger.warning("RSS scraper not implemented yet")
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="RSS scraping is not yet implemented"
    )
