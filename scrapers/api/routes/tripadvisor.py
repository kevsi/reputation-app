from fastapi import APIRouter, HTTPException, status
from loguru import logger
from ..models.schemas import TripAdvisorRequest, ScraperResponse
from ..utils.rate_limiter import rate_limit

router = APIRouter()

@router.post("/tripadvisor", response_model=ScraperResponse)
@rate_limit(calls=5, period=60)
async def scrape_tripadvisor(request: TripAdvisorRequest) -> ScraperResponse:
    logger.warning("TripAdvisor scraper not implemented yet")
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TripAdvisor scraping is not yet implemented"
    )
