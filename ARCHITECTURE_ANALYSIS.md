# 🏗️ ANALYSE ARCHITECTURALE COMPLÈTE - SENTINELLE REPUTATION

**Date:** 7 Février 2026  
**Analyste:** Architecte Logiciel Senior  
**Objectif:** Audit complet de l'architecture API, sécurité, ingestion de données et scalabilité

---

## 📋 TABLE DES MATIÈRES

1. [Analyse Globale de l'Architecture](#1-analyse-globale)
2. [Authentification & Sécurité](#2-authentification--sécurité)
3. [Ingestion des Données (Scraping)](#3-ingestion-des-données)
4. [Pagination & Volumétrie](#4-pagination--volumétrie)
5. [Architecture Idéale Proposée](#5-architecture-idéale)
6. [Améliorations & Alternatives](#6-améliorations--alternatives)
7. [Risques Futurs & Solutions](#7-risques-futurs)

---

## 1️⃣ ANALYSE GLOBALE DE L'ARCHITECTURE

### 1.1 Structure Actuelle du Projet

```
sentinelle-reputation/
├── api/                    # API Backend (Node.js + Express + Prisma)
├── scrapers/               # Scrapers Python (Scrapy)
├── ai-service/             # Service IA (Python + FastAPI)
├── database/               # Schéma Prisma + Migrations
├── apps/
│   ├── web/               # Frontend principal (React + Vite)
│   ├── admin/             # Panel admin
│   └── landing/           # Site marketing
├── shared/                # Types et constantes partagés
└── infrastructure/        # Docker + K8s configs
```

### 1.2 Architecture Actuelle (3 Services)

**✅ BONNE APPROCHE : Modular Monolith**

```
┌─────────────────────────────────────────────────────────────┐
│                     ARCHITECTURE ACTUELLE                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│  API (Node)  │─────▶│  PostgreSQL  │
│  React/Vite  │      │   Express    │      │   Database   │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼──────┐  ┌──────▼────────┐
            │   Scrapers   │  │  AI Service   │
            │   (Python)   │  │   (Python)    │
            └──────┬───────┘  └───────────────┘
                   │
            ┌──────▼───────┐
            │    Redis     │
            │  (Queue/Cache)│
            └──────────────┘
```

### 1.3 Modules API Identifiés (14 modules)

| Module | Responsabilité | État | Authentification |
|--------|---------------|------|------------------|
| **auth** | Inscription, login, tokens JWT | ✅ Complet | Public + Protected |
| **users** | Gestion utilisateurs | ✅ Complet | ✅ requireAuth |
| **organizations** | Gestion organisations | ✅ Complet | ✅ requireAuth |
| **billing** | Abonnements Stripe | ✅ Complet | ✅ requireAuth |
| **brands** | Marques surveillées | ✅ Complet | ✅ requireAuth |
| **sources** | Sources de données | ✅ Complet | ✅ requireAuth |
| **mentions** | Mentions collectées | ✅ Complet | ✅ requireAuth |
| **keywords** | Mots-clés surveillés | ✅ Complet | ✅ requireAuth |
| **alerts** | Alertes conditionnelles | ✅ Complet | ✅ requireAuth |
| **actions** | Actions stratégiques | ✅ Complet | ✅ requireAuth |
| **analytics** | Analyses et métriques | ✅ Complet | ✅ requireAuth |
| **reports** | Génération de rapports | ✅ Complet | ✅ requireAuth |
| **notifications** | Notifications utilisateur | ✅ Complet | ✅ requireAuth |
| **system** | Status système/AI | ✅ Complet | ✅ requireAuth |

### 1.4 Flux de Données par Module

#### 📊 Module MENTIONS (Exemple Type)

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX MENTIONS                             │
└─────────────────────────────────────────────────────────────┘

1. RÉCEPTION
   Scraper Python → PostgreSQL (via pipeline.py)
   ↓
2. VALIDATION
   Schema Prisma (externalId unique, platform enum)
   ↓
3. STOCKAGE
   Table mentions (brandId, sourceId, content, sentiment)
   ↓
4. EXPOSITION
   GET /api/v1/mentions?brandId=X
   ├─ requireAuth middleware
   ├─ mentions.controller.ts
   ├─ mentions.service.ts
   └─ mentions.repository.ts
```

#### 🔌 Module SOURCES

```
1. RÉCEPTION (Frontend)
   POST /api/v1/sources
   Body: { brandId, type, name, config }
   ↓
2. VALIDATION
   ├─ Vérification plan limits (maxSources)
   ├─ Validation credentials (testConnection)
   └─ Vérification domaines interdits
   ↓
3. STOCKAGE
   Table sources (brandId, type, config, isActive)
   ↓
4. DÉCLENCHEMENT SCRAPING
   scrapingQueue.add('scrape-source', { sourceId })
   ↓
5. EXPOSITION
   GET /api/v1/sources?organizationId=X
```

---

## 2️⃣ AUTHENTIFICATION & SÉCURITÉ

### 2.1 Mécanisme d'Authentification Actuel

**✅ ARCHITECTURE CENTRALISÉE ET COHÉRENTE**

```typescript
// Flux d'authentification
┌──────────────────────────────────────────────────────────┐
│                  AUTHENTIFICATION JWT                     │
└──────────────────────────────────────────────────────────┘

1. LOGIN
   POST /api/v1/auth/login
   ├─ Validation email/password (Zod)
   ├─ Vérification bcrypt
   ├─ Génération JWT (accessToken + refreshToken)
   └─ Retour tokens + user data

2. PROTECTION DES ROUTES
   Middleware: requireAuth
   ├─ Extraction Bearer token
   ├─ Vérification JWT signature
   ├─ Récupération user depuis DB
   └─ Injection req.user

3. REFRESH TOKEN
   POST /api/v1/auth/refresh
   ├─ Validation refreshToken
   ├─ Génération nouveau accessToken
   └─ Retour nouveau token
```

### 2.2 Middleware de Sécurité (auth.middleware.ts)

```typescript
export const requireAuth = async (req, res, next) => {
  // 1. Extraction du token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401, 'NO_TOKEN');
  }

  // 2. Vérification JWT
  const token = authHeader.substring(7);
  const payload = jwtService.verifyToken(token);

  // 3. Récupération user à jour depuis DB
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { organization: true }
  });

  if (!user) {
    throw new AppError('User not found', 401, 'USER_NOT_FOUND');
  }

  // 4. Injection dans req.user
  req.user = {
    userId: user.id,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role
  };

  next();
};
```

### 2.3 Analyse de Cohérence entre Modules

**✅ TOUS LES MODULES UTILISENT LE MÊME MÉCANISME**

| Module | Middleware Auth | Vérification Org | Vérification Plan |
|--------|----------------|------------------|-------------------|
| mentions | ✅ requireAuth | ✅ Via brandId | ❌ Non |
| sources | ✅ requireAuth | ✅ Via brandId | ✅ Oui (maxSources) |
| brands | ✅ requireAuth | ✅ Direct | ✅ Oui (maxBrands) |
| alerts | ✅ requireAuth | ✅ Via brandId | ❌ Non |
| keywords | ✅ requireAuth | ✅ Via brandId | ❌ Non |
| actions | ✅ requireAuth | ❌ Non | ❌ Non |
| analytics | ✅ requireAuth | ✅ Via brandId | ❌ Non |
| reports | ✅ requireAuth | ✅ Via brandId | ❌ Non |

### 2.4 Failles de Sécurité Identifiées

#### 🔴 CRITIQUE : Isolation des Données

**Problème:** Certains modules ne vérifient pas l'ownership

```typescript
// ❌ FAILLE : Module Actions
async getAllActions(req: Request, res: Response) {
  // Récupère TOUTES les actions sans filtrer par organization
  const actions = await prisma.action.findMany();
  // ⚠️ Un utilisateur peut voir les actions d'autres orgs
}

// ✅ CORRECT : Module Mentions
async getMentions(req: Request, res: Response) {
  const user = req.user;
  const mentions = await prisma.mention.findMany({
    where: {
      brand: {
        organizationId: user.organizationId // ✅ Filtrage
      }
    }
  });
}
```

#### 🟠 MOYEN : Rate Limiting Global

**Problème:** Rate limiting appliqué globalement, pas par utilisateur

```typescript
// Actuel (app.ts)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limite globale
});

// ⚠️ Un utilisateur peut consommer toute la limite
```

#### 🟡 FAIBLE : Validation des Inputs

**Problème:** Validation Zod incohérente

```typescript
// ✅ BIEN : Module Auth
router.post('/login', validate(loginSchema), authController.login);

// ❌ MAL : Module Sources
router.post('/', sourcesController.createSource); // Pas de validation Zod
```

### 2.5 Recommandations Sécurité

```typescript
// 1. Middleware d'isolation des données
export const requireOrganization = async (req, res, next) => {
  const { organizationId } = req.user;
  
  // Vérifier que la ressource appartient à l'org
  const resource = await prisma[req.resourceType].findFirst({
    where: {
      id: req.params.id,
      organizationId
    }
  });
  
  if (!resource) {
    throw new AppError('Resource not found', 404, 'NOT_FOUND');
  }
  
  next();
};

// 2. Rate limiting par utilisateur
const userLimiter = rateLimit({
  keyGenerator: (req) => req.user?.userId || req.ip,
  windowMs: 15 * 60 * 1000,
  max: 100
});

// 3. Validation Zod systématique
router.post('/', 
  requireAuth,
  validate(createSourceSchema),
  sourcesController.createSource
);
```

---

## 3️⃣ INGESTION DES DONNÉES (SCRAPING)

### 3.1 Architecture de Scraping Actuelle

```
┌─────────────────────────────────────────────────────────────┐
│              FLUX D'INGESTION DES DONNÉES                    │
└─────────────────────────────────────────────────────────────┘

1. CONFIGURATION SOURCE
   Frontend → POST /api/v1/sources
   ├─ Validation credentials
   ├─ Création source en DB
   └─ Déclenchement premier scraping

2. QUEUE SCRAPING
   scrapingQueue.add('scrape-source', { sourceId })
   ├─ Redis (BullMQ)
   └─ Job persisté

3. WORKER PYTHON (Scrapy)
   ├─ Récupération job depuis Redis
   ├─ Lecture config source depuis DB
   ├─ Exécution spider (trustpilot.py, news.py, etc.)
   └─ Collecte mentions

4. PIPELINE PYTHON
   ├─ Validation item (items.py)
   ├─ Enrichissement metadata
   └─ Insertion PostgreSQL (pipelines.py)

5. ANALYSE IA (Optionnel)
   ├─ Détection sentiment
   ├─ Extraction keywords
   └─ Update mention.sentiment
```

### 3.2 Scrapers Disponibles

| Scraper | Fichier | État | Pagination | Format Output |
|---------|---------|------|------------|---------------|
| Trustpilot | trustpilot.py | ✅ Actif | ✅ Oui (next page) | JSONL + DB |
| Google Reviews | google_reviews.py | ✅ Actif | ❌ Non | JSONL + DB |
| News | news.py | ✅ Actif | ❌ Non | JSONL + DB |
| SensCritique | senscritique.py | ✅ Actif | ❌ Non | JSONL + DB |

### 3.3 Pipeline d'Insertion (pipelines.py)

```python
class DatabasePipeline:
    def process_item(self, item, spider):
        # 1. Récupérer brandId depuis source
        self.cur.execute("SELECT \"brandId\" FROM sources WHERE id = %s", 
                        (source_id,))
        brand_id = self.cur.fetchone()[0]
        
        # 2. Insérer mention avec UPSERT
        query = """
            INSERT INTO mentions (
                id, "brandId", "sourceId", platform, author, content,
                url, "publishedAt", "scrapedAt", sentiment, "externalId"
            ) VALUES (
                DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, 'NEUTRAL', %s
            )
            ON CONFLICT ("externalId", platform) DO UPDATE SET
                content = EXCLUDED.content,
                "publishedAt" = EXCLUDED."publishedAt";
        """
        
        self.cur.execute(query, (
            brand_id, source_id, item['platform'],
            item['author'], item['content'], item['url'],
            item['published_at'], item['scraped_at'], item['external_id']
        ))
        self.conn.commit()
```

### 3.4 Problèmes Identifiés

#### 🔴 CRITIQUE : Pas de Workers Node.js

**Problème:** Le dossier `workers/` n'existe pas dans l'API

```bash
# Attendu (selon README.md)
api/
└── workers/
    ├── processors/
    │   ├── scraping.processor.ts
    │   └── analysis.processor.ts
    └── jobs/
        └── scheduled-scraping.job.ts

# Réel
❌ Dossier workers/ absent
```

**Impact:**
- Pas de scheduler automatique
- Pas de gestion des jobs récurrents
- Scraping manuel uniquement

#### 🔴 CRITIQUE : Pas de Gestion d'Erreurs Scraping

```python
# pipelines.py
try:
    self.cur.execute(query, ...)
    self.conn.commit()
except Exception as e:
    self.logger.error(f"❌ Failed to save item: {e}")
    self.conn.rollback()
    # ⚠️ Item perdu, pas de retry
```

#### 🟠 MOYEN : Pas de Validation de Format

```python
# Pas de validation Pydantic/Marshmallow
item['content']  # Peut être None, vide, ou trop long
item['published_at']  # Format non vérifié
```

### 3.5 Recommandations Ingestion

```typescript
// 1. Créer workers/ avec BullMQ
// api/src/workers/scraping.processor.ts
import { Worker } from 'bullmq';
import { exec } from 'child_process';

const worker = new Worker('scraping', async (job) => {
  const { sourceId } = job.data;
  
  // Récupérer config source
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    include: { brand: true }
  });
  
  // Lancer scraper Python
  const command = `scrapy crawl ${source.type.toLowerCase()} \
    -a source_id=${sourceId} \
    -a company_name=${source.config.companyName}`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve({ stdout, stderr });
    });
  });
}, {
  connection: redisConnection,
  concurrency: 5
});

// 2. Scheduler récurrent
import cron from 'node-cron';

cron.schedule('*/30 * * * *', async () => {
  const sources = await prisma.source.findMany({
    where: { isActive: true }
  });
  
  for (const source of sources) {
    const lastScraped = source.lastScrapedAt;
    const frequency = source.scrapingFrequency; // en secondes
    
    if (!lastScraped || Date.now() - lastScraped.getTime() > frequency * 1000) {
      await scrapingQueue.add('scrape-source', { sourceId: source.id });
    }
  }
});
```

---

## 4️⃣ PAGINATION & VOLUMÉTRIE

### 4.1 Pagination Actuelle

#### API (mentions.service.ts)

```typescript
// ❌ PAS DE PAGINATION IMPLÉMENTÉE
async getMentions(filters) {
  return await prisma.mention.findMany({
    where: filters,
    include: { brand: true, source: true },
    orderBy: { createdAt: 'desc' }
    // ⚠️ Pas de take/skip
  });
}
```

#### Scrapers (trustpilot.py)

```python
# ✅ PAGINATION IMPLÉMENTÉE
def parse(self, response):
    # Traiter les reviews
    for review in reviews:
        yield item
    
    # Pagination
    next_page = response.css('a[name="pagination-button-next"]::attr(href)').get()
    if next_page:
        yield response.follow(next_page, callback=self.parse)
```

### 4.2 Problèmes de Volumétrie

#### 🔴 CRITIQUE : Pas de Limite sur les Requêtes

```typescript
// ❌ DANGEREUX : Peut retourner 1M+ mentions
GET /api/v1/mentions?brandId=X
// Pas de pagination → Timeout, OOM

// ❌ DANGEREUX : Pas de limite sur le scraping
// Un scraper peut tourner indéfiniment
```

#### 🔴 CRITIQUE : Pas de Batch Processing

```python
# pipelines.py
for item in items:
    self.cur.execute(query, ...)  # 1 query par item
    self.conn.commit()  # 1 commit par item
    
# ⚠️ 10,000 items = 10,000 queries + commits
```

### 4.3 Solution de Pagination Robuste

```typescript
// shared/utils/pagination.ts
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginate<T>(
  model: any,
  where: any,
  params: PaginationParams
): Promise<PaginatedResponse<T>> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' }
    }),
    model.count({ where })
  ]);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

// Utilisation
async getMentions(filters, pagination: PaginationParams) {
  return await paginate(prisma.mention, filters, pagination);
}
```

```python
# scrapers/pipelines.py - Batch Insert
class DatabasePipeline:
    def __init__(self):
        self.items_buffer = []
        self.buffer_size = 100
    
    def process_item(self, item, spider):
        self.items_buffer.append(item)
        
        if len(self.items_buffer) >= self.buffer_size:
            self.flush_buffer()
        
        return item
    
    def flush_buffer(self):
        if not self.items_buffer:
            return
        
        # Batch insert avec executemany
        query = """INSERT INTO mentions (...) VALUES (%s, %s, ...)"""
        values = [(item['brand_id'], item['content'], ...) 
                  for item in self.items_buffer]
        
        self.cur.executemany(query, values)
        self.conn.commit()
        
        self.items_buffer = []
    
    def close_spider(self, spider):
        self.flush_buffer()  # Flush remaining items
```

---

## 5️⃣ ARCHITECTURE IDÉALE PROPOSÉE

### 5.1 Flux de Données Optimisé

```
┌─────────────────────────────────────────────────────────────┐
│           ARCHITECTURE CIBLE (PRODUCTION-READY)              │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Frontend   │
│  (React)     │
└──────┬───────┘
       │ HTTPS + JWT
       ▼
┌──────────────────────────────────────────────────────────┐
│                    API GATEWAY                            │
│  - Rate Limiting (par user)                              │
│  - Authentication (JWT)                                  │
│  - Request Validation (Zod)                              │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                  API MONOLITH (Express)                   │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Auth      │  │  Mentions   │  │  Analytics  │     │
│  │   Module    │  │   Module    │  │   Module    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Sources    │  │   Brands    │  │   Reports   │     │
│  │   Module    │  │   Module    │  │   Module    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└──────┬────────────────────────┬──────────────────────────┘
       │                        │
       ▼                        ▼
┌──────────────┐        ┌──────────────┐
│  PostgreSQL  │        │    Redis     │
│  (Primary)   │        │ (Cache/Queue)│
└──────────────┘        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Workers    │
                        │  (BullMQ)    │
                        └──────┬───────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
            ┌───────────────┐     ┌──────────────┐
            │   Scrapers    │     │ AI Service   │
            │   (Python)    │     │  (Python)    │
            └───────────────┘     └──────────────┘
```

### 5.2 Structure des Endpoints Idéale

```
/api/v1/
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh
│   ├── POST   /forgot-password
│   ├── POST   /reset-password
│   └── GET    /me
│
├── /organizations
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── /brands
│   ├── GET    /?organizationId=X&page=1&limit=20
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── /sources
│   ├── GET    /?brandId=X&page=1&limit=20
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── DELETE /:id
│   ├── POST   /test-connection
│   └── POST   /:id/scrape-now
│
├── /mentions
│   ├── GET    /?brandId=X&sentiment=NEGATIVE&page=1&limit=50
│   ├── POST   /search (filtres avancés)
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── DELETE /:id
│   └── POST   /batch-action
│
├── /analytics
│   ├── GET    /summary?brandId=X&period=30d
│   ├── GET    /sentiment-breakdown?brandId=X
│   ├── GET    /time-series?brandId=X&period=daily
│   └── GET    /top-keywords?brandId=X&limit=10
│
├── /alerts
│   ├── GET    /?brandId=X&status=NEW
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── /reports
│   ├── GET    /?brandId=X
│   ├── POST   /generate
│   ├── GET    /:id
│   └── GET    /:id/download
│
└── /system
    ├── GET    /health
    ├── GET    /status
    └── GET    /metrics
```

### 5.3 Structure de Dossiers Optimisée

```
api/src/
├── config/
│   ├── database.ts
│   ├── redis.ts
│   ├── queue.ts
│   └── app.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.service.ts
│   │   ├── password.service.ts
│   │   └── auth.validation.ts
│   │
│   ├── mentions/
│   │   ├── mentions.routes.ts
│   │   ├── mentions.controller.ts
│   │   ├── mentions.service.ts
│   │   ├── mentions.repository.ts
│   │   ├── mentions.validation.ts
│   │   └── mentions.types.ts
│   │
│   └── [autres modules...]
│
├── shared/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── plan-guard.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   ├── pagination.ts
│   │   ├── api-response.ts
│   │   ├── errors.ts
│   │   └── validators.ts
│   │
│   └── database/
│       ├── prisma.client.ts
│       └── base.repository.ts
│
├── workers/
│   ├── processors/
│   │   ├── scraping.processor.ts
│   │   ├── analysis.processor.ts
│   │   └── notifications.processor.ts
│   │
│   ├── jobs/
│   │   ├── scheduled-scraping.job.ts
│   │   ├── daily-analytics.job.ts
│   │   └── cleanup.job.ts
│   │
│   └── index.ts
│
└── infrastructure/
    ├── queue/
    │   ├── scraping.queue.ts
    │   └── queue.service.ts
    │
    ├── cache/
    │   └── redis.service.ts
    │
    └── logger/
        └── logger.service.ts
```

---

## 6️⃣ AMÉLIORATIONS & ALTERNATIVES

### 6.1 Amélioration 1 : Validation Centralisée

**Problème Actuel:** Validation incohérente

```typescript
// ❌ Actuel : Validation manuelle
if (!brandId || !type || !name) {
  res.status(400).json({ error: 'Missing fields' });
}

// ✅ Proposé : Validation Zod centralisée
// shared/validators/schemas.ts
export const createSourceSchema = z.object({
  brandId: z.string().cuid(),
  type: z.enum(['TRUSTPILOT', 'GOOGLE_REVIEWS', 'NEWS']),
  name: z.string().min(3).max(100),
  config: z.object({
    companyName: z.string().optional(),
    url: z.string().url().optional()
  })
});

// Utilisation
router.post('/', 
  requireAuth,
  validate(createSourceSchema),
  sourcesController.createSource
);
```

### 6.2 Amélioration 2 : Repository Pattern

**Problème Actuel:** Logique DB dans les services

```typescript
// ❌ Actuel : Service fait tout
class SourcesService {
  async createSource(input) {
    const brand = await prisma.brand.findUnique(...);
    const count = await prisma.source.count(...);
    const source = await prisma.source.create(...);
    return source;
  }
}

// ✅ Proposé : Séparation Repository
// sources.repository.ts
class SourcesRepository {
  async findById(id: string) {
    return prisma.source.findUnique({ where: { id } });
  }
  
  async findByBrand(brandId: string) {
    return prisma.source.findMany({ where: { brandId } });
  }
  
  async create(data: CreateSourceDTO) {
    return prisma.source.create({ data });
  }
  
  async countByOrganization(orgId: string) {
    return prisma.source.count({
      where: { brand: { organizationId: orgId } }
    });
  }
}

// sources.service.ts
class SourcesService {
  constructor(
    private repo: SourcesRepository,
    private brandRepo: BrandsRepository
  ) {}
  
  async createSource(input) {
    const brand = await this.brandRepo.findById(input.brandId);
    const count = await this.repo.countByOrganization(brand.organizationId);
    
    if (count >= maxSources) {
      throw new AppError('Limit reached', 403);
    }
    
    return await this.repo.create(input);
  }
}
```

### 6.3 Amélioration 3 : Event-Driven Architecture

**Problème Actuel:** Couplage fort

```typescript
// ❌ Actuel : Tout dans le controller
async createSource(req, res) {
  const source = await sourcesService.createSource(input);
  await scrapingQueue.add('scrape', { sourceId: source.id });
  await notificationService.notify('Source created');
  await analyticsService.track('source_created');
  res.json(source);
}

// ✅ Proposé : Event Emitter
// infrastructure/events/event-bus.ts
import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

// sources.service.ts
async createSource(input) {
  const source = await this.repo.create(input);
  
  // Émettre événement
  eventBus.emit('source.created', { source });
  
  return source;
}

// listeners/source.listeners.ts
eventBus.on('source.created', async ({ source }) => {
  await scrapingQueue.add('scrape', { sourceId: source.id });
  await notificationService.notify('Source created');
  await analyticsService.track('source_created');
});
```

### 6.4 Alternative : GraphQL au lieu de REST

**Avantages:**
- Requêtes flexibles (évite over-fetching)
- Typage fort automatique
- Subscriptions temps réel

```graphql
# Exemple de requête GraphQL
query GetMentions($brandId: ID!, $page: Int!, $limit: Int!) {
  mentions(brandId: $brandId, page: $page, limit: $limit) {
    data {
      id
      content
      sentiment
      author
      source {
        name
        type
      }
    }
    pagination {
      total
      hasNext
    }
  }
}
```

**Inconvénients:**
- Courbe d'apprentissage
- Complexité accrue
- Caching plus difficile

**Recommandation:** ❌ Garder REST pour l'instant (simplicité)

---

## 7️⃣ RISQUES FUTURS & SOLUTIONS

### 7.1 Risque 1 : Scalabilité Base de Données

**Problème:** PostgreSQL unique point de défaillance

**Symptômes futurs:**
- Requêtes lentes (>1s) avec 1M+ mentions
- Locks sur les tables
- Backup/restore longs

**Solutions:**

```sql
-- 1. Indexes optimisés
CREATE INDEX CONCURRENTLY idx_mentions_brand_sentiment 
ON mentions(brandId, sentiment, publishedAt DESC);

CREATE INDEX CONCURRENTLY idx_mentions_search 
ON mentions USING gin(to_tsvector('french', content));

-- 2. Partitioning par date
CREATE TABLE mentions_2026_01 PARTITION OF mentions
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- 3. Read Replicas
-- Master: Writes
-- Replica 1: Analytics queries
-- Replica 2: Mentions listing
```

```typescript
// Prisma avec Read Replicas
const prismaWrite = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

const prismaRead = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_READ_URL } }
});

// Utilisation
async getMentions() {
  return prismaRead.mention.findMany(); // Read replica
}

async createMention() {
  return prismaWrite.mention.create(); // Master
}
```

### 7.2 Risque 2 : Dépassement Limites de Scraping

**Problème:** Scrapers bloqués par les sites cibles

**Symptômes futurs:**
- IP bannie (Trustpilot, Google)
- Rate limiting (429 errors)
- CAPTCHAs

**Solutions:**

```python
# 1. Rotation de proxies
# scrapers/settings.py
ROTATING_PROXY_LIST = [
    'proxy1.example.com:8000',
    'proxy2.example.com:8000',
]

# 2. User-Agent rotation
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
]

# 3. Delays adaptatifs
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 5
AUTOTHROTTLE_MAX_DELAY = 60

# 4. Retry avec backoff exponentiel
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]
```

```typescript
// API: Circuit Breaker pattern
class ScraperCircuitBreaker {
  private failures = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute(sourceId: string) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker OPEN');
    }
    
    try {
      await scrapingQueue.add('scrape', { sourceId });
      this.failures = 0;
      this.state = 'CLOSED';
    } catch (error) {
      this.failures++;
      
      if (this.failures >= 5) {
        this.state = 'OPEN';
        setTimeout(() => this.state = 'HALF_OPEN', 60000);
      }
      
      throw error;
    }
  }
}
```

### 7.3 Risque 3 : Coûts d'Infrastructure

**Problème:** Coûts explosifs avec la croissance

**Projection:**

| Utilisateurs | Mentions/jour | DB Size | Coût/mois |
|--------------|---------------|---------|-----------|
| 100 | 10,000 | 5 GB | $50 |
| 1,000 | 100,000 | 50 GB | $200 |
| 10,000 | 1,000,000 | 500 GB | $1,000 |
| 100,000 | 10,000,000 | 5 TB | $5,000+ |

**Solutions:**

```typescript
// 1. Archivage automatique
cron.schedule('0 0 * * *', async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  // Archiver mentions anciennes vers S3
  const oldMentions = await prisma.mention.findMany({
    where: { createdAt: { lt: sixMonthsAgo } }
  });
  
  await s3.upload({
    Bucket: 'sentinelle-archive',
    Key: `mentions-${Date.now()}.json.gz`,
    Body: gzip(JSON.stringify(oldMentions))
  });
  
  // Supprimer de la DB
  await prisma.mention.deleteMany({
    where: { createdAt: { lt: sixMonthsAgo } }
  });
});

// 2. Compression des données
// Stocker seulement les métadonnées, pas le contenu complet
interface MentionCompact {
  id: string;
  brandId: string;
  sentiment: string;
  publishedAt: Date;
  contentHash: string; // SHA256 du contenu
  s3Key?: string; // Lien vers contenu complet si nécessaire
}

// 3. Limites par plan
const PLAN_LIMITS = {
  FREE: {
    maxMentionsStored: 1000,
    retentionDays: 30
  },
  PRO: {
    maxMentionsStored: 50000,
    retentionDays: 180
  },
  ENTERPRISE: {
    maxMentionsStored: -1, // Illimité
    retentionDays: 365
  }
};
```

### 7.4 Risque 4 : Sécurité des Données

**Problème:** Fuite de données sensibles

**Vecteurs d'attaque:**
- SQL Injection
- XSS dans les mentions
- Accès non autorisé aux données

**Solutions:**

```typescript
// 1. Sanitization des inputs
import DOMPurify from 'isomorphic-dompurify';

async createMention(data) {
  const sanitized = {
    ...data,
    content: DOMPurify.sanitize(data.content),
    author: DOMPurify.sanitize(data.author)
  };
  
  return prisma.mention.create({ data: sanitized });
}

// 2. Encryption at rest
// database/prisma/schema.prisma
model Source {
  id String @id
  config Json @db.JsonB // ⚠️ Credentials en clair
}

// Chiffrement AES-256
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString();
}

// Utilisation
async createSource(input) {
  const encryptedConfig = {
    ...input.config,
    apiKey: encrypt(input.config.apiKey)
  };
  
  return prisma.source.create({
    data: { ...input, config: encryptedConfig }
  });
}

// 3. Audit logs
model AuditLog {
  id String @id
  userId String
  action String // 'CREATE', 'READ', 'UPDATE', 'DELETE'
  entity String // 'Mention', 'Source', etc.
  entityId String
  changes Json? // Avant/après
  ipAddress String
  createdAt DateTime @default(now())
}

// Middleware d'audit
const auditMiddleware = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Logger l'action
    prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: req.method,
        entity: req.baseUrl,
        entityId: req.params.id,
        ipAddress: req.ip
      }
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};
```

### 7.5 Risque 5 : Disponibilité (Downtime)

**Problème:** API indisponible = perte de données de scraping

**Solutions:**

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        max_attempts: 3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    deploy:
      replicas: 1
    volumes:
      - postgres_data:/var/lib/postgresql/data
    # Backup automatique
    command: >
      bash -c "
        while true; do
          pg_dump -U postgres sentinelle > /backups/backup-$(date +%Y%m%d-%H%M%S).sql
          sleep 3600
        done
      "
```

```typescript
// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server gracefully');
  
  // 1. Arrêter d'accepter nouvelles requêtes
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // 2. Terminer les jobs en cours
  await scrapingQueue.close();
  
  // 3. Fermer connexions DB
  await prisma.$disconnect();
  
  // 4. Exit
  process.exit(0);
});
```

---

## 📊 RÉSUMÉ EXÉCUTIF

### Points Forts ✅

1. **Architecture modulaire** bien structurée (14 modules cohérents)
2. **Authentification centralisée** avec JWT (cohérente sur tous les modules)
3. **Scraping fonctionnel** avec Scrapy (4 scrapers actifs)
4. **Base de données bien modélisée** (Prisma avec relations claires)
5. **Séparation des responsabilités** (API, Scrapers, AI Service)

### Points Critiques 🔴

1. **Pas de workers Node.js** → Scraping manuel uniquement
2. **Pas de pagination** → Risque de timeout sur gros volumes
3. **Isolation des données incomplète** → Faille de sécurité
4. **Pas de batch processing** → Performance limitée
5. **Validation incohérente** → Risque d'erreurs runtime

### Priorités d'Action

| Priorité | Action | Impact | Effort |
|----------|--------|--------|--------|
| 🔴 P0 | Implémenter workers BullMQ | Critique | 2j |
| 🔴 P0 | Ajouter pagination partout | Critique | 1j |
| 🔴 P0 | Corriger isolation des données | Sécurité | 1j |
| 🟠 P1 | Batch processing scrapers | Performance | 1j |
| 🟠 P1 | Validation Zod systématique | Qualité | 2j |
| 🟡 P2 | Repository pattern | Maintenabilité | 3j |
| 🟡 P2 | Event-driven architecture | Scalabilité | 3j |

### Recommandation Finale

**L'architecture actuelle est SOLIDE pour un MVP**, mais nécessite des améliorations critiques avant la production à grande échelle :

1. **Court terme (1 semaine)** : Workers + Pagination + Isolation
2. **Moyen terme (1 mois)** : Batch processing + Validation + Monitoring
3. **Long terme (3 mois)** : Read replicas + Archivage + Circuit breakers

**Verdict:** 🟢 **Architecture viable avec corrections urgentes**

