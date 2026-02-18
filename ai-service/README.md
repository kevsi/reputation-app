# AI Service

## Overview

The AI Service is a Python-based microservice that provides advanced natural language processing (NLP) capabilities for the Reputation App platform. It offers sentiment analysis, keyword extraction, topic classification, language detection, and emotion detection through a RESTful API.

## Objectives

### Primary Goals
- **Sentiment Analysis**: Analyze the emotional tone of text (positive, negative, neutral)
- **Keyword Extraction**: Identify important keywords and phrases in content
- **Topic Analysis**: Classify content into predefined categories
- **Language Detection**: Detect the language of the input text
- **Emotion Detection**: Identify specific emotions (joy, anger, sadness, etc.)

### Technical Objectives
- **Low Latency**: Process requests in under 100ms
- **High Accuracy**: Achieve 90%+ accuracy on classification tasks
- **Scalability**: Handle 1000+ requests per second
- **Reliability**: 99.9% uptime with graceful degradation
- **Model Caching**: Efficiently cache and reuse loaded models

## Architecture

### Tech Stack
- **Runtime**: Python 3.10+
- **Framework**: FastAPI
- **ML Libraries**: 
  - Transformers (Hugging Face)
  - NLTK
  - TextBlob
- **Caching**: Redis
- **Async**: Uvicorn with asyncio
- **Validation**: Pydantic

### Module Structure

```
src/
├── api/
│   ├── app.py           # FastAPI application
│   ├── dependencies.py   # Shared dependencies
│   └── routes/          # API endpoints
│       ├── emotions.py
│       ├── health.py
│       ├── keywords.py
│       ├── language.py
│       ├── sentiment.py
│       └── topics.py
├── models/              # ML models
│   ├── emotion_detector.py
│   ├── keyword_extractor.py
│   ├── language_detector.py
│   ├── model_state.py
│   ├── sentiment_analyzer.py
│   └── topic_analyzer.py
├── schemas/             # Pydantic schemas
│   ├── requests.py
│   └── responses.py
├── config/              # Configuration
│   ├── __init__.py
│   ├── logging.py
│   └── settings.py
├── utils/               # Utilities
│   ├── cache.py
│   ├── download_models.py
│   ├── exceptions.py
│   └── preprocessing.py
└── tests/               # Unit tests
```

## Rules & Guidelines

### Development Rules

1. **Python Code Style**
   - Follow PEP 8 style guide
   - Use type hints for all functions
   - Maximum line length: 100 characters
   - Use f-strings for string formatting
   - Use dataclasses for simple data structures

2. **API Design**
   - Use RESTful conventions
   - Follow FastAPI best practices
   - Return appropriate HTTP status codes
   - Use Pydantic for request/response validation

3. **Error Handling**
   - Use custom exception classes
   - Return structured error responses
   - Log errors with appropriate context
   - Never expose internal errors to clients

4. **ML Model Guidelines**
   - Use pre-trained models when available
   - Implement model caching for performance
   - Handle model loading errors gracefully
   - Use batch processing when possible

5. **Testing**
   - Write unit tests for all models
   - Mock external API calls
   - Test edge cases
   - Maintain 80% code coverage

### Code Style

```python
# Good example
from dataclasses import dataclass
from typing import Optional

@dataclass
class SentimentResult:
    """Result of sentiment analysis."""
    label: str
    score: float
    confidence: float

async def analyze_sentiment(text: str) -> SentimentResult:
    """Analyze sentiment of the given text."""
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")
    
    # Process text
    result = await model.predict(text)
    
    return SentimentResult(
        label=result.label,
        score=result.score,
        confidence=result.confidence
    )
```

### API Response Format

```json
// Sentiment Analysis
{
  "success": true,
  "data": {
    "label": "positive",
    "score": 0.98,
    "confidence": 0.95
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Text is required",
    "details": []
  }
}
```

## Getting Started

### Prerequisites
- Python 3.10+
- Redis 6+ (for caching)

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies (optional)
pip install -r requirements-dev.txt

# Copy environment file
cp .env.example .env

# Configure environment variables
# See Configuration section below

# Download ML models
python src/utils/download_models.py

# Start the service
python src/main.py
```

### Environment Variables

```env
# Service
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Redis Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Model Settings
MODEL_CACHE_DIR=/tmp/models
SENTIMENT_MODEL=distilbert-base-uncased-finetuned-sst-2-english
LANGUAGE_MODEL=prajjwal1/bert-small
```

### Available Scripts

```bash
# Start service
python src/main.py              # Run with uvicorn
python -m uvicorn src.api.app   # Alternative

# Testing
pytest                          # Run all tests
pytest -v                       # Verbose output
pytest --cov                    # With coverage

# Development
pip install -r requirements-dev.txt
black src/                      # Format code
flake8 src/                     # Lint code
mypy src/                      # Type check
```

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/live` | Liveness probe |

### Sentiment Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sentiment` | Analyze sentiment |
| POST | `/api/sentiment/batch` | Batch sentiment analysis |

**Request Body:**
```json
{
  "text": "This product is amazing! I love it."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "label": "positive",
    "score": 0.99,
    "confidence": 0.97
  }
}
```

### Keyword Extraction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/keywords` | Extract keywords |

**Request Body:**
```json
{
  "text": "The new iPhone features a better camera and longer battery life.",
  "max_keywords": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "keywords": [
      {"text": "iPhone", "score": 0.95},
      {"text": "camera", "score": 0.85},
      {"text": "battery", "score": 0.80}
    ]
  }
}
```

### Topic Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/topics` | Classify topics |

**Request Body:**
```json
{
  "text": "Stock market reached new highs today."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topics": [
      {"label": "finance", "score": 0.92},
      {"label": "business", "score": 0.78}
    ]
  }
}
```

### Language Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/language` | Detect language |

**Request Body:**
```json
{
  "text": "Bonjour tout le monde"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "fr",
    "confidence": 0.99
  }
}
```

### Emotion Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emotions` | Detect emotions |

**Request Body:**
```json
{
  "text": "I'm so happy and excited about this!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emotions": [
      {"label": "joy", "score": 0.89},
      {"label": "excitement", "score": 0.75}
    ]
  }
}
```

## Models

### Sentiment Analysis
- **Model**: DistilBERT fine-tuned on SST-2
- **Labels**: positive, negative, neutral
- **Accuracy**: ~92%

### Keyword Extraction
- **Method**: TF-IDF with noun phrase extraction
- **Max Keywords**: 10 (configurable)

### Topic Classification
- **Model**: Custom classifier with predefined topics
- **Categories**: Technology, Business, Sports, Entertainment, Politics, Health, Science, Finance

### Language Detection
- **Method**: FastText language identification
- **Supported Languages**: 50+

### Emotion Detection
- **Model**: DistilBERT fine-tuned on emotion dataset
- **Emotions**: joy, sadness, anger, fear, surprise, disgust

## Performance

### Benchmarks
- Sentiment Analysis: ~50ms
- Keyword Extraction: ~30ms
- Topic Classification: ~40ms
- Language Detection: ~20ms
- Emotion Detection: ~50ms

### Optimization Tips
1. Enable Redis caching for repeated queries
2. Use batch endpoints for multiple texts
3. Adjust model precision based on accuracy requirements
4. Monitor memory usage with multiple models loaded

## Monitoring

### Logging
- Structured JSON logging
- Different log levels: DEBUG, INFO, WARNING, ERROR
- Request/response logging
- Model inference timing

### Metrics
- Request latency (p50, p95, p99)
- Error rate
- Cache hit rate
- Model inference time

## Security

- Validate all inputs with Pydantic
- Sanitize outputs
- Implement rate limiting (optional)
- Use environment variables for configuration

## License

Proprietary - All rights reserved
