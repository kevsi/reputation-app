
import uvicorn
from .config.logging import configure_logging
from .api.app import create_app
from .config.settings import settings

# Configure logging first
configure_logging()

app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        workers=settings.WORKERS,
        reload=False
    )