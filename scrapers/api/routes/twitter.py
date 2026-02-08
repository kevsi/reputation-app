from fastapi import APIRouter, HTTPException, status
from loguru import logger
from ..models.schemas import TwitterRequest, ScraperResponse
from ..utils.rate_limiter import rate_limit

router = APIRouter()

@router.post("/twitter", response_model=ScraperResponse)
@rate_limit(calls=5, period=60)
async def scrape_twitter(request: TwitterRequest) -> ScraperResponse:
    logger.warning("Twitter scraper not implemented yet")
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Twitter scraping is not yet implemented"
    )
