FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Playwright and browsers
RUN apt-get update && apt-get install -y \
    # Build tools
    gcc \
    g++ \
    # Browser dependencies (Chromium)
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    # Additional libraries
    libglib2.0-0 \
    libdbus-1-3 \
    libx11-xcb1 \
    libxcb1 \
    libxshmfence1 \
    fonts-liberation \
    fontconfig \
    # curl for health checks
    curl \
    # unzip for extraction
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN python -m playwright install chromium --with-deps

# Copy application
COPY . .

# Create logs directory
RUN mkdir -p logs

# Environment variables
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run application
CMD ["python", "-m", "api.main"]
