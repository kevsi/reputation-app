#!/bin/bash

echo "🚀 Déploiement de Sentinelle Réputation..."

# Build Docker images
docker build -f infrastructure/docker/Dockerfile.web -t sentinelle-web:latest .
docker build -f infrastructure/docker/Dockerfile.api -t sentinelle-api:latest .

# Push vers registry (à adapter selon votre registry)
# docker push sentinelle-web:latest
# docker push sentinelle-api:latest

echo "✅ Déploiement terminé !"