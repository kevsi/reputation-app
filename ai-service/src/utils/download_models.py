
from transformers import pipeline
import spacy
from ..config.settings import settings
import structlog

# Configure a simple logger for build time
logging_configured = False

def get_logger():
    global logging_configured
    if not logging_configured:
        structlog.configure(
            processors=[
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.stdlib.add_log_level,
                structlog.dev.ConsoleRenderer(),
            ],
        )
        logging_configured = True
    return structlog.get_logger()

def download_models():
    logger = get_logger()
    
    models = [
        ("sentiment-analysis", settings.SENTIMENT_MODEL),
        ("text-classification", settings.EMOTION_MODEL),
    ]
    
    for task, model_name in models:
        logger.info(f"Downloading {task} model: {model_name}...")
        try:
            pipeline(task, model=model_name)
            logger.info(f"Successfully downloaded {model_name}")
        except Exception as e:
            logger.error(f"Failed to download {model_name}", error=str(e))
            # We don't necessarily want to fail the build if it's a transient network error,
            # but in Docker it's better to fail so we know the image is incomplete.
            raise e

    logger.info("All transformer models downloaded.")

if __name__ == "__main__":
    download_models()
