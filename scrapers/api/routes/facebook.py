from fastapi import APIRouter, HTTPException, status
from loguru import logger
from ..models.schemas import FacebookRequest, ScraperResponse
from ..utils.rate_limiter import rate_limit

router = APIRouter()

@router.post("/facebook", response_model=ScraperResponse)
@rate_limit(calls=5, period=60)
async def scrape_facebook(request: FacebookRequest) -> ScraperResponse:
    logger.warning("Facebook scraper not implemented yet")
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Facebook scraping is not yet implemented"
    )
