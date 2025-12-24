sentinelle-reputation/
│
├── apps/                           # Applications principales
│   │
│   ├── web/                        # 🖥️ Dashboard utilisateurs
│   │   ├── src/
│   │   │   ├── components/        # Composants UI réutilisables
│   │   │   │   ├── ui/           # Buttons, Modals, Cards
│   │   │   │   ├── layout/       # Sidebar, Header, Footer
│   │   │   │   └── shared/       # Composants partagés
│   │   │   ├── features/         # Logique métier par domaine
│   │   │   │   ├── auth/         # Connexion, inscription
│   │   │   │   ├── dashboard/    # Vue globale
│   │   │   │   ├── mentions/     # Gestion mentions
│   │   │   │   ├── alerts/       # Gestion alertes
│   │   │   │   ├── analysis/     # Analyses et tendances
│   │   │   │   ├── reports/      # Rapports
│   │   │   │   ├── actions/      # Actions et interventions
│   │   │   │   ├── sources/      # Configuration sources
│   │   │   │   └── settings/     # Paramètres
│   │   │   ├── pages/            # Pages principales (8)
│   │   │   ├── services/         # Appels API
│   │   │   ├── stores/           # State management (Zustand)
│   │   │   ├── hooks/            # Custom hooks
│   │   │   └── utils/            # Utilitaires
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── api/                        # 🔧 Backend API (NestJS)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # JWT, login, register
│   │   │   │   ├── organizations/ # Multi-tenant
│   │   │   │   ├── users/        # Utilisateurs et rôles
│   │   │   │   ├── sources/      # Configuration sources
│   │   │   │   ├── mentions/     # CRUD mentions
│   │   │   │   ├── alerts/       # Système alertes
│   │   │   │   ├── analysis/     # Stats et tendances
│   │   │   │   ├── reports/      # Génération rapports
│   │   │   │   ├── actions/      # Actions interventions
│   │   │   │   └── notifications/ # Email/SMS/Push
│   │   │   ├── common/           # Guards, Pipes, Filters
│   │   │   ├── database/         # Prisma config
│   │   │   └── jobs/             # Bull jobs dispatcher
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Schéma DB
│   │   └── package.json
│   │
│   ├── landing/                    # 🌐 Site marketing (Next.js)
│   │   ├── app/
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── features/         # Page fonctionnalités
│   │   │   ├── pricing/          # Page tarifs
│   │   │   ├── blog/             # Blog
│   │   │   └── contact/          # Contact/Démo
│   │   ├── components/
│   │   └── package.json
│   │
│   └── admin/                      # 👨‍💼 Back-office admin
│       ├── src/
│       │   ├── pages/            # Gestion clients SaaS
│       │   ├── components/       # Monitoring plateforme
│       │   └── services/         # Facturation
│       └── package.json
│
├── services/                       # Microservices
│   │
│   ├── scraper/                    # 🕷️ Collecte de données
│   │   ├── src/
│   │   │   ├── collectors/
│   │   │   │   ├── reddit/       # Reddit API
│   │   │   │   ├── twitter/      # Twitter/X API
│   │   │   │   ├── discord/      # Discord bots
│   │   │   │   ├── google-reviews/ # Google Reviews
│   │   │   │   ├── forums/       # Web scraping
│   │   │   │   └── base.collector.ts
│   │   │   ├── schedulers/       # Cron jobs
│   │   │   ├── queue/            # Bull queue
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── ai/                         # 🤖 Intelligence Artificielle
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── sentiment.py    # Analyse sentiment
│   │   │   │   │   ├── emotions.py     # Détection émotions
│   │   │   │   │   └── prediction.py   # Prédiction viralité
│   │   │   │   └── main.py
│   │   │   ├── models/           # Modèles ML
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── venv/                 # Python virtual env
│   │   └── requirements.txt
│   │
│   ├── realtime/                   # 🔴 WebSocket (temps réel)
│   │   ├── src/
│   │   │   ├── gateways/
│   │   │   │   └── websocket.gateway.ts
│   │   │   ├── services/
│   │   │   │   └── redis.service.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── workers/                    # ⚙️ Background jobs
│       ├── src/
│       │   ├── jobs/
│       │   │   ├── analysis.job.ts      # Envoie mentions vers IA
│       │   │   ├── reports.job.ts       # Génère PDF
│       │   │   ├── notifications.job.ts # Envoie email/SMS
│       │   │   ├── cleanup.job.ts       # Nettoie vieilles données
│       │   │   └── aggregation.job.ts   # Calcule stats
│       │   ├── processors/       # Traite les jobs
│       │   ├── queues/           # Config Bull
│       │   ├── services/         # Email, SMS, PDF
│       │   └── utils/
│       └── package.json
│
├── packages/                       # Code partagé
│   │
│   ├── types/                      # 📦 Types TypeScript partagés
│   │   ├── src/
│   │   │   ├── user.types.ts
│   │   │   ├── organization.types.ts
│   │   │   ├── mention.types.ts
│   │   │   ├── alert.types.ts
│   │   │   ├── source.types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── utils/                      # 🛠️ Utilitaires communs
│       ├── src/
│       │   ├── date.utils.ts
│       │   ├── string.utils.ts
│       │   ├── validation.utils.ts
│       │   ├── api.utils.ts
│       │   └── index.ts
│       └── package.json
│
├── infrastructure/                 # Infrastructure & DevOps
│   │
│   ├── docker/                     # 🐳 Dockerfiles
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.scraper
│   │   ├── Dockerfile.ai
│   │   ├── Dockerfile.realtime
│   │   ├── Dockerfile.workers
│   │   └── nginx.conf
│   │
│   ├── k8s/                        # ☸️ Kubernetes
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── configmaps/
│   │   ├── secrets/
│   │   └── ingress/
│   │
│   ├── terraform/                  # 🏗️ Infrastructure as Code
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── scripts/                    # 📜 Scripts automatisation
│       ├── dev.sh                 # Démarre tout en dev
│       ├── build.sh               # Build tous les projets
│       └── deploy.sh              # Déploiement
│
├── docker-compose.yml              # Docker Compose (dev)
├── package.json                    # Root package.json (monorepo)
├── .gitignore
└── README.md