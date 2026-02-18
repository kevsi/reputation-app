from loguru import logger
import sys
from ..config import settings

def setup_logger():
    """Configurer le logger global"""
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
        level=settings.log_level,
    )
    logger.add(
        settings.log_file,
        rotation="10 MB",
        retention="7 days",
        level=settings.log_level,
    )
    return logger
