#!/usr/bin/env bash

# 🚀 FREE SOURCES IMPLEMENTATION - QUICK START GUIDE
#
# This script guides you through the setup process step by step
# Takes ~15 minutes to complete

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 SENTINELLE - FREE SOURCES IMPLEMENTATION QUICK START"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will guide you through:"
echo "  1. Obtaining API keys for 5 free sources"
echo "  2. Configuring your .env file"
echo "  3. Validating the configuration"
echo "  4. Testing all collectors"
echo "  5. Ready for production!"
echo ""
echo "Estimated time: 15 minutes"
echo ""

# Step 1: Check .env exists
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: Check .env File"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo ""
    echo "Creating .env file..."
    cat > .env << 'EOF'
# FREE SOURCES (Required)
GOOGLE_API_KEY=
REDDIT_API_KEY=
YOUTUBE_API_KEY=
YELP_API_KEY=
NEWS_API_KEY=

# PAID SOURCES (Optional)
TWITTER_API_KEY=
FACEBOOK_API_KEY=

# Database
DATABASE_URL=

# Redis
REDIS_URL=redis://localhost:6379
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file found"
fi

echo ""
echo ""

# Step 2: Obtain API Keys
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 STEP 2: Obtain API Keys (5 required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📌 API #1: Google Places API"
echo "   1. Go to https://console.cloud.google.com"
echo "   2. Create a new project"
echo "   3. Enable 'Google Places API'"
echo "   4. Create an API key"
echo "   5. Add to .env: GOOGLE_API_KEY=your_key_here"
echo "   ⏱️  Time: ~2 minutes"
echo ""

read -p "Press ENTER when you've added GOOGLE_API_KEY to .env..."

echo ""
echo "📌 API #2: Reddit API"
echo "   1. Go to https://www.reddit.com/prefs/apps"
echo "   2. Click 'Create App' → Select 'Script'"
echo "   3. Fill form (name, description)"
echo "   4. Copy the 'client_id' (first part)"
echo "   5. Add to .env: REDDIT_API_KEY=client_id_here"
echo "   ⏱️  Time: ~2 minutes"
echo ""

read -p "Press ENTER when you've added REDDIT_API_KEY to .env..."

echo ""
echo "📌 API #3: YouTube Data API v3"
echo "   1. Go to https://console.cloud.google.com"
echo "   2. Select your existing project (or create new)"
echo "   3. Enable 'YouTube Data API v3'"
echo "   4. Create an API key"
echo "   5. Add to .env: YOUTUBE_API_KEY=your_key_here"
echo "   ⏱️  Time: ~2 minutes"
echo ""

read -p "Press ENTER when you've added YOUTUBE_API_KEY to .env..."

echo ""
echo "📌 API #4: Yelp Fusion API"
echo "   1. Go to https://www.yelp.com/developers/v3/manage_app"
echo "   2. Create a new app"
echo "   3. Copy the 'API Key'"
echo "   4. Add to .env: YELP_API_KEY=your_key_here"
echo "   ⏱️  Time: ~2 minutes"
echo ""

read -p "Press ENTER when you've added YELP_API_KEY to .env..."

echo ""
echo "📌 API #5: NewsAPI.org"
echo "   1. Go to https://newsapi.org/register"
echo "   2. Sign up for a free account"
echo "   3. Copy your API key from dashboard"
echo "   4. Add to .env: NEWS_API_KEY=your_key_here"
echo "   ⏱️  Time: ~2 minutes"
echo ""

read -p "Press ENTER when you've added NEWS_API_KEY to .env..."

echo ""
echo "✅ All 5 API keys configured!"
echo ""
echo ""

# Step 3: Validate Configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ STEP 3: Validate Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Running validation script..."
echo ""

npx ts-node validate-config.ts

echo ""
echo ""

# Step 4: Test Collectors
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 STEP 4: Test All Collectors"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Running collector tests..."
echo ""

npx ts-node test-all-collectors.ts

echo ""
echo ""

# Step 5: Migration Report
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STEP 5: Migration Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Displaying migration statistics..."
echo ""

npx ts-node final-migration.ts

echo ""
echo ""

# Final Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Your system is now ready for production!"
echo ""
echo "Next steps:"
echo "  1. Review the FREE-SOURCES-GUIDE.md for detailed documentation"
echo "  2. Configure source instances in your database"
echo "  3. Test with: npm test"
echo "  4. Deploy to production: npm run build && npm start"
echo ""
echo "Daily quota available:"
echo "  • Google Places:  2,500 requests"
echo "  • Reddit:         ∞ unlimited"
echo "  • YouTube:        10,000 units"
echo "  • Yelp:          5,000 requests"
echo "  • NewsAPI:       100 requests"
echo "  ─────────────────────────────"
echo "  TOTAL:           ~1,017,600 + unlimited Reddit"
echo ""
echo "For support, see documentation in FREE-SOURCES-GUIDE.md"
echo ""
