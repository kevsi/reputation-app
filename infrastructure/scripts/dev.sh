#!/bin/bash

echo "🚀 Démarrage de Sentinelle Réputation (Dev Mode)"

# Démarrer Docker services
echo "📦 Démarrage des services Docker..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente des services..."
sleep 5

# Démarrer les applications en parallèle
echo "🎯 Démarrage des applications..."

# Backend API
cd apps/api && npm run start:dev &

# Frontend Web
cd apps/web && npm run dev &

# Landing Page
cd apps/landing && npm run dev &

# Services
cd services/scraper && npm run dev &
cd services/realtime && npm run dev &
cd services/workers && npm run dev &

# Service IA (Python)
cd services/ai && source venv/bin/activate && uvicorn src.api.main:app --reload &

echo "✅ Tous les services sont démarrés !"
echo "📍 URLs:"
echo "   - Frontend: http://localhost:5173"
echo "   - API: http://localhost:3000"
echo "   - Landing: http://localhost:3001"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - MinIO: http://localhost:9001"

wait