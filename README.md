# Reputation App

## Overview

Reputation App is a comprehensive reputation management platform designed to help businesses monitor, analyze, and improve their online presence. The platform aggregates mentions from various social media sources, provides AI-powered sentiment analysis, and offers actionable insights through an intuitive API.

## Objectives

### Primary Goals
- **Monitor Brand Reputation**: Track what people say about your brand across multiple social media platforms
- **Analyze Sentiment**: Use advanced AI to understand the emotional tone behind mentions (positive, negative, neutral)
- **Track Keywords**: Monitor specific keywords and topics relevant to your business
- **Generate Reports**: Create comprehensive reports on brand health and trends
- **Alert System**: Get notified immediately when important mentions are detected

### Secondary Goals
- **Multi-source Integration**: Support for various social media platforms and review sites
- **Real-time Processing**: Process mentions in real-time as they appear
- **Scalable Architecture**: Handle millions of mentions efficiently
- **Secure Data**: Ensure all user data is encrypted and protected

## Architecture

The project is organized into two main services:

### API Service (`/api`)
The main backend API built with Node.js/TypeScript, featuring:
- **Authentication**: JWT-based auth with advanced security features
- **Modules**: Users, Organizations, Brands, Sources, Mentions, Analytics, Alerts, Actions, Billing, Notifications
- **Database**: Prisma ORM with PostgreSQL
- **Caching**: Redis for performance optimization
- **Queue**: Bull for job processing
- **Security**: Encryption, rate limiting, CORS, Helmet

### AI Service (`/ai-service`)
A Python-based AI microservice providing:
- **Sentiment Analysis**: Analyze the emotional tone of text
- **Keyword Extraction**: Identify important keywords in content
- **Topic Analysis**: Categorize content by topics
- **Language Detection**: Detect the language of content
- **Emotion Detection**: Identify specific emotions in text

## Project Structure

```
reputation-app/
├── api/                    # Main API backend
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── infrastructure/ # Infrastructure services
│   │   └── config/        # Configuration
│   └── package.json
├── ai-service/            # AI microservice
│   ├── src/
│   │   ├── api/          # FastAPI endpoints
│   │   ├── models/       # ML models
│   │   ├── utils/        # Utilities
│   │   └── config/       # Configuration
│   └── requirements.txt
└── README.md             # This file
```

## Rules & Guidelines

### Development Rules

1. **Code Quality**
   - Use TypeScript strict mode in the API
   - Follow PEP 8 for Python code in AI service
   - Write meaningful commit messages
   - Document all public APIs

2. **Security**
   - Never commit secrets or API keys
   - Use environment variables for sensitive data
   - Implement proper input validation
   - Use parameterized queries to prevent SQL injection

3. **Git Workflow**
   - Create feature branches for new features
   - Use meaningful branch names (e.g., `feature/user-auth`)
   - Submit Pull Requests for review
   - Keep commits atomic and focused

4. **Testing**
   - Write unit tests for new features
   - Maintain minimum 80% code coverage
   - Run tests before merging

### API Usage Rules

1. **Rate Limiting**
   - Authenticated: 1000 requests/minute
   - Unauthenticated: 100 requests/minute

2. **Authentication**
   - All protected endpoints require JWT token
   - Tokens expire after 1 hour
   - Refresh tokens valid for 7 days

3. **Error Handling**
   - Use standard HTTP status codes
   - Return detailed error messages
   - Log all errors for debugging

### Data Rules

1. **Privacy**
   - Don't collect unnecessary personal data
   - Implement data retention policies
   - Allow users to delete their data

2. **Storage**
   - Use efficient database indexing
   - Implement pagination for large datasets
   - Archive old data appropriately

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **API Service**
```bash
cd api
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

2. **AI Service**
```bash
cd ai-service
pip install -r requirements.txt
# Configure your environment variables
python src/main.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user

### Mentions
- `GET /api/mentions` - List mentions
- `POST /api/mentions` - Create mention
- `GET /api/mentions/:id` - Get mention details

### Analytics
- `GET /api/analytics/sentiment` - Get sentiment analytics
- `GET /api/analytics/trends` - Get trend data
- `GET /api/analytics/summary` - Get summary statistics

### Sources
- `GET /api/sources` - List sources
- `POST /api/sources` - Add new source
- `GET /api/sources/:id/analyze` - Analyze source

## Support

For questions or issues, please open a GitHub issue or contact the development team.

## License

Proprietary - All rights reserved
