# Sentinelle Workers

Ce module gère les tâches asynchrones de la plateforme Sentinelle-Reputation.

## Fonctionnalités

*   **Scraping** : Collecte automatique de mentions depuis diverses sources (Trustpilot, etc.).
*   **Analyse** : Analyse de sentiment via le service IA (Python/FastAPI).
*   **Alertes & Notifications** : Envoi de notifications aux utilisateurs.
*   **Rapports** : Génération de synthèses périodiques pour les marques.

## Architecture

Le système utilise **Bull (Redis)** pour la gestion des files d'attente (queues) :
- `scraping` : Jobs de collecte de données.
- `analysis` : Jobs d'analyse de sentiment (enchaînés après le scraping).
- `notifications` : Envoi d'emails ou notifications système.
- `reports` : Génération de rapports analytiques.

## Installation

```bash
cd workers
npm install
```

## Développement

Pour lancer les workers en mode développement avec rechargement automatique :

```bash
npm run dev
```

## Variables d'Environnement

Le module nécessite un fichier `.env` à la racine ou dans le dossier `workers/` :

- `DATABASE_URL` : URL de la base de données PostgreSQL.
- `REDIS_URL` : URL du serveur Redis (par défaut `redis://localhost:6379`).
- `AI_SERVICE_URL` : URL du service d'analyse IA (par défaut `http://localhost:8000`).
- `TRIGGER_INITIAL_SCRAPE` : `true` pour lancer un scraping dès le démarrage (dev).

```
workers
├─ .env
├─ .turbo
│  └─ turbo-build.log
├─ check_db.js
├─ check_db.ts
├─ dist
│  ├─ collectors
│  │  ├─ base.collector.js
│  │  ├─ facebook.collector.js
│  │  ├─ google_reviews.collector.js
│  │  ├─ index.js
│  │  ├─ reddit.collector.js
│  │  ├─ trustpilot.collector.js
│  │  ├─ twitter.collector.js
│  │  ├─ web.collector.js
│  │  └─ youtube.collector.js
│  ├─ config
│  │  ├─ database.js
│  │  └─ queues.js
│  ├─ index.js
│  ├─ jobs
│  │  └─ scheduled-scraping.job.js
│  ├─ lib
│  │  ├─ forbidden-domains.js
│  │  ├─ monitor.js
│  │  └─ queues.js
│  ├─ processors
│  │  ├─ analysis.processor.js
│  │  ├─ mention.processor.js
│  │  ├─ notifications.processor.js
│  │  ├─ reports.processor.js
│  │  └─ scraping.processor.js
│  ├─ scheduler.js
│  ├─ scraping
│  │  ├─ engine
│  │  │  ├─ fetcher.js
│  │  │  └─ scraper.engine.js
│  │  ├─ examples
│  │  │  └─ test_scraper.js
│  │  ├─ index.js
│  │  ├─ parsers
│  │  │  ├─ base.parser.js
│  │  │  ├─ forum.parser.js
│  │  │  └─ review.parser.js
│  │  └─ types
│  │     └─ scraping.types.js
│  ├─ services
│  │  ├─ ai.service.js
│  │  └─ alert-checker.service.js
│  └─ utils
│     └─ keywords.js
├─ package.json
├─ README.md
├─ src
│  ├─ collectors
│  │  ├─ base.collector.js
│  │  ├─ base.collector.ts
│  │  ├─ facebook.collector.ts
│  │  ├─ google_reviews.collector.ts
│  │  ├─ index.js
│  │  ├─ index.ts
│  │  ├─ reddit.collector.ts
│  │  ├─ trustpilot.collector.js
│  │  ├─ trustpilot.collector.ts
│  │  ├─ twitter.collector.js
│  │  ├─ twitter.collector.ts
│  │  ├─ web.collector.ts
│  │  └─ youtube.collector.ts
│  ├─ config
│  │  ├─ database.js
│  │  ├─ database.ts
│  │  ├─ queues.js
│  │  └─ queues.ts
│  ├─ index.js
│  ├─ index.ts
│  ├─ jobs
│  │  ├─ scheduled-scraping.job.js
│  │  └─ scheduled-scraping.job.ts
│  ├─ lib
│  │  ├─ forbidden-domains.ts
│  │  ├─ monitor.js
│  │  ├─ monitor.ts
│  │  ├─ queues.js
│  │  └─ queues.ts
│  ├─ processors
│  │  ├─ analysis.processor.js
│  │  ├─ analysis.processor.ts
│  │  ├─ mention.processor.js
│  │  ├─ mention.processor.ts
│  │  ├─ notifications.processor.js
│  │  ├─ notifications.processor.ts
│  │  ├─ reports.processor.js
│  │  ├─ reports.processor.ts
│  │  ├─ scraping.processor.js
│  │  ├─ scraping.processor.ts
│  │  └─ SOURCEANALYZER_INTEGRATION.md
│  ├─ scheduler.ts
│  ├─ scraping
│  │  ├─ engine
│  │  │  ├─ fetcher.ts
│  │  │  └─ scraper.engine.ts
│  │  ├─ examples
│  │  │  └─ test_scraper.ts
│  │  ├─ index.ts
│  │  ├─ parsers
│  │  │  ├─ base.parser.ts
│  │  │  ├─ forum.parser.ts
│  │  │  └─ review.parser.ts
│  │  └─ types
│  │     └─ scraping.types.ts
│  ├─ services
│  │  ├─ ai.service.js
│  │  ├─ ai.service.ts
│  │  ├─ alert-checker.service.js
│  │  └─ alert-checker.service.ts
│  └─ utils
│     ├─ keywords.js
│     └─ keywords.ts
├─ test-collectors.mjs
├─ test-mention.js
├─ test-scraper-standalone.ts
├─ trigger-scraping.ts
└─ tsconfig.json

```