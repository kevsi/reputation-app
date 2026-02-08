# Sentinelle Reputations - Scrapers Service

Service de collecte de données pour Sentinelle Reputation. Ce service expose une API REST FastAPI pour déclencher des scrapings sur diverses sources (Google Reviews, Trustpilot, News, etc.) et intègre également des spiders Scrapy pour des tâches de fond plus lourdes ou complexes.

## 🎯 Fonctionnalités

- **API REST** : FastAPI pour une interaction facile et standardisée.
- **Support Multi-Sources** : Google Reviews, Trustpilot, TripAdvisor, News API, Twitter, Reddit, RSS, YouTube.
- **Robustesse** : Rate limiting, gestion d'erreurs, retry logic.
- **Architecture Hybride** : API synchrone/asynchrone + Spiders Scrapy (fallback).

## 📁 Structure

```
scrapers/
├── api/                              # API FastAPI
│   ├── main.py                       # Point d'entrée
│   ├── config.py                     # Configuration
│   ├── routes/                       # Endpoints par source
│   ├── models/                       # Modèles Pydantic ({Request, Response} schemas)
│   └── utils/                        # Rate limiter, validateurs, logger
├── sentinelle_scrapers/              # Scrapers Scrapy (Legacy/Advanced)
├── requirements.txt
├── Dockerfile
└── .env                              # Configuration (clés API)
```

## 🚀 Installation & Démarrage

### Pré-requis

- Python 3.9+
- Clés API pour les services externes (Google, NewsAPI, Twitter, etc.)

### Installation Locale

1. Créer un environnement virtuel :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Ou venv\Scripts\activate sur Windows
   ```

2. Installer les dépendances :
   ```bash
   pip install -r requirements.txt
   ```

3. Configurer l'environnement :
   Copier `.env.example` vers `.env` et remplir les variables.
   ```bash
   cp .env.example .env
   ```

4. Lancer le serveur :
   ```bash
   python -m api.main
   # Ou
   uvicorn api.main:app --reload
   ```

   L'API sera accessible sur `http://localhost:8001`.
   Documentation Swagger : `http://localhost:8001/docs`

### Docker

```bash
docker build -t sentinelle-scrapers .
docker run -p 8001:8001 --env-file .env sentinelle-scrapers
```

## 🔌 Endpoints Principaux

- `POST /scrape/google-reviews` : Scraper les avis Google Maps.
- `POST /scrape/trustpilot` : Scraper les avis Trustpilot.
- `POST /scrape/tripadvisor` : Scraper les avis TripAdvisor.
- `POST /scrape/news` : Scraper les articles de presse via NewsAPI.
- `POST /scrape/twitter` : Scraper Twitter (X).
- `POST /scrape/reddit` : Scraper Reddit.
- `POST /scrape/rss` : Scraper un flux RSS.
- `POST /scrape/youtube` : Scraper les commentaires/vidéos YouTube.

Voir `/docs` pour les détails des payloads (paramètres, clés API, etc.).

## 🛡️ Rate Limiting

L'API utilise `slowapi` pour limiter le nombre de requêtes par IP afin de protéger les ressources et les quotas API externes.
Configuration par défaut : `RATE_LIMIT_PER_MINUTE=60` (ajustable dans `.env`).

## 🛠️ Développement

### Tests
```bash
pytest api/tests/ -v
```

### Ajouter une nouvelle source
1. Créer le modèle de requête dans `api/models/schemas.py`.
2. Créer le fichier de route `api/routes/nouvelle_source.py`.
3. Implémenter la logique de scraping (API externe ou HTML scraping).
4. Enregistrer la route dans `api/main.py`.
