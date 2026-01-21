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
