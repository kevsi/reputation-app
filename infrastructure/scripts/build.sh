#!/bin/bash

echo "🏗️ Build de tous les projets..."

# Build packages partagés
echo "📦 Build des packages..."
cd packages/types && npm run build
cd ../utils && npm run build

# Build apps
echo "🎯 Build des applications..."
cd ../../apps/web && npm run build
cd ../api && npm run build
cd ../landing && npm run build
cd ../admin && npm run build

# Build services
echo "⚙️ Build des services..."
cd ../../services/scraper && npm run build
cd ../realtime && npm run build
cd ../workers && npm run build

echo "✅ Build terminé !"