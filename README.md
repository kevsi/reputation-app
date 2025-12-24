# 🛡️ Sentinelle Réputation

Plateforme SaaS de gestion proactive de la réputation en ligne.

## 🏗️ Architecture

- **apps/web** - Dashboard utilisateurs (React + Vite)
- **apps/api** - Backend API (NestJS)
- **apps/landing** - Site marketing (Next.js)
- **apps/admin** - Back-office admin (React)
- **services/scraper** - Collecte de données
- **services/ai** - Analyse IA/NLP (Python)
- **services/realtime** - WebSocket (Socket.io)
- **services/workers** - Background jobs (Bull)
- **packages/types** - Types TypeScript partagés
- **packages/utils** - Utilitaires communs
- **infrastructure/** - Docker, K8s, Terraform

## 🚀 Démarrage rapide
```bash
# Installer les dépendances
npm install

# Démarrer tous les services
npm run dev

# Ou individuellement
npm run dev:api
npm run dev:web
```

## 🗄️ Base de données
```bash
# Démarrer PostgreSQL + Redis
npm run docker:up

# Migrations
npm run db:migrate

# Studio Prisma
npm run db:studio
```

## 🏗️ Build
```bash
# Build tous les projets
npm run build

# Build individuel
npm run build:web
npm run build:api
```

## 📦 Structure
```
sentinelle-reputation/
├── apps/              # Applications
├── services/          # Microservices
├── packages/          # Code partagé
└── infrastructure/    # Config infra
```
```

---

## 📊 **STRUCTURE FINALE COMPLÈTE**
```
sentinelle-reputation/
├── apps/
│   ├── web/                    # Frontend Dashboard
│   ├── api/                    # Backend API
│   ├── landing/                # Landing Page
│   └── admin/                  # Admin Dashboard
├── services/
│   ├── scraper/                # Service Scraping
│   ├── ai/                     # Service IA/NLP
│   ├── realtime/               # Service WebSocket
│   └── workers/                # Background Jobs
├── packages/
│   ├── types/                  # Types partagés
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── utils/                  # Utilitaires
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.scraper
│   │   ├── Dockerfile.ai
│   │   ├── Dockerfile.realtime
│   │   ├── Dockerfile.workers
│   │   └── nginx.conf
│   ├── k8s/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── configmaps/
│   │   └── ingress/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── scripts/
│       ├── dev.sh
│       ├── build.sh
│       └── deploy.sh
├── docker-compose.yml
├── package.json
├── .gitignore
└── README.md
```

---

## ✅ **CHECKLIST COMPLÈTE**
```
✅ Dossier racine + Git
✅ apps/web
✅ apps/api
✅ apps/landing
✅ apps/admin
✅ services/scraper
✅ services/ai
✅ services/realtime
✅ services/workers
✅ packages/types
✅ packages/utils
✅ infrastructure/docker
✅ infrastructure/k8s
✅ infrastructure/terraform
✅ infrastructure/scripts
✅ docker-compose.yml
✅ package.json racine
✅ .gitignore
✅ README.md