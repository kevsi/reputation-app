from fastapi import APIRouter, HTTPException, status
from loguru import logger
from ..models.schemas import RedditRequest, ScraperResponse
from ..utils.rate_limiter import rate_limit

router = APIRouter()

@router.post("/reddit", response_model=ScraperResponse)
@rate_limit(calls=5, period=60)
async def scrape_reddit(request: RedditRequest) -> ScraperResponse:
    logger.warning("Reddit scraper not implemented yet")
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Reddit scraping is not yet implemented"
    )
