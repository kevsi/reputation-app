# 🚀 PLAN D'ACTION - SENTINELLE REPUTATION

**Date de création:** 7 Février 2026  
**Objectif:** Corriger les failles critiques et préparer la production  
**Durée estimée:** 2-3 semaines

---

## 📊 VUE D'ENSEMBLE

### Statistiques du Projet

| Métrique | Valeur |
|----------|--------|
| **Modules API** | 14 modules |
| **Failles critiques** | 5 problèmes |
| **Failles moyennes** | 8 problèmes |
| **Améliorations proposées** | 12 tâches |
| **Effort total estimé** | 15-20 jours |

### Phase 3 : Optimisations (Performance & Scalabilité) ✅
| ID | Tâche | Description | Priorité | État |
|---|---|---|---|---|
| 3.1 | Caching Redis | Cache des agrégations analytics et listes fréquentes | Haute | ✅ |
| 3.2 | Index BD | Optimisation des index Postgres pour les gros volumes | Haute | ✅ |
| 3.3 | Archivage | Système d'archivage automatique vers S3 (vieilles données) | Moyenne | ✅ |

### Répartition par Priorité

```
🔴 P0 - CRITIQUE (5 tâches)     → 5 jours
🟠 P1 - IMPORTANT (4 tâches)    → 6 jours
🟡 P2 - MOYEN (3 tâches)        → 4 jours
🟢 P3 - OPTIONNEL (3 tâches)    → 3 jours
```

---

## 🔴 PHASE 1 : CORRECTIONS CRITIQUES (Semaine 1)

### Tâche 1.1 : Implémenter Workers BullMQ ⏱️ 2 jours

**Priorité:** 🔴 P0 - CRITIQUE  
**Impact:** Sans workers, le scraping automatique ne fonctionne pas  
**Effort:** 2 jours

#### Problème Actuel
```
❌ Dossier api/src/workers/ n'existe pas
❌ Pas de scheduler automatique
❌ Scraping manuel uniquement via POST /sources/:id/scrape-now
```

#### Solution

**Étape 1.1.1 : Créer la structure workers/**

```bash
mkdir -p api/src/workers/{processors,jobs,schedulers}
```

**Fichiers à créer:**

```typescript
// api/src/workers/processors/scraping.processor.ts
import { Worker, Job } from 'bullmq';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '@/shared/database/prisma.client';
import { logger } from '@/infrastructure/logger';
import { redisConnection } from '@/config/redis';

const execAsync = promisify(exec);

export const scrapingWorker = new Worker(
  'scraping',
  async (job: Job) => {
    const { sourceId, force } = job.data;
    
    logger.info(`🚀 Starting scraping job for source ${sourceId}`);
    
    // 1. Récupérer la source
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: { brand: true }
    });
    
    if (!source) {
      throw new Error(`Source ${sourceId} not found`);
    }
    
    if (!source.isActive && !force) {
      logger.warn(`⏸️ Source ${sourceId} is inactive, skipping`);
      return { skipped: true };
    }
    
    // 2. Créer un scraping job en DB
    const scrapingJob = await prisma.scrapingJob.create({
      data: {
        sourceId,
        status: 'RUNNING',
        startedAt: new Date()
      }
    });
    
    try {
      // 3. Construire la commande Scrapy
      const spiderName = source.type.toLowerCase();
      const config = source.config as any;
      
      let command = `cd scrapers && scrapy crawl ${spiderName}`;
      command += ` -a source_id=${sourceId}`;
      
      // Ajouter les paramètres selon le type
      if (config.companyName) {
        command += ` -a company_name=${config.companyName}`;
      }
      if (config.url) {
        command += ` -a url=${config.url}`;
      }
      if (source.brand.keywords?.length) {
        command += ` -a keywords=${source.brand.keywords.join(',')}`;
      }
      
      logger.info(`📝 Executing: ${command}`);
      
      // 4. Exécuter le scraper
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30 * 60 * 1000 // 30 minutes max
      });
      
      logger.info(`✅ Scraping completed for source ${sourceId}`);
      logger.debug(`STDOUT: ${stdout}`);
      
      if (stderr) {
        logger.warn(`STDERR: ${stderr}`);
      }
      
      // 5. Compter les mentions créées
      const mentionsCount = await prisma.mention.count({
        where: {
          sourceId,
          createdAt: {
            gte: scrapingJob.startedAt
          }
        }
      });
      
      // 6. Mettre à jour le job
      await prisma.scrapingJob.update({
        where: { id: scrapingJob.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          mentionsFound: mentionsCount,
          mentionsCreated: mentionsCount
        }
      });
      
      // 7. Mettre à jour la source
      await prisma.source.update({
        where: { id: sourceId },
        data: {
          lastScrapedAt: new Date(),
          errorCount: 0,
          lastError: null
        }
      });
      
      return {
        success: true,
        mentionsCreated: mentionsCount,
        duration: Date.now() - scrapingJob.startedAt.getTime()
      };
      
    } catch (error) {
      logger.error(`❌ Scraping failed for source ${sourceId}:`, error);
      
      // Mettre à jour le job avec l'erreur
      await prisma.scrapingJob.update({
        where: { id: scrapingJob.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      // Incrémenter le compteur d'erreurs de la source
      await prisma.source.update({
        where: { id: sourceId },
        data: {
          errorCount: { increment: 1 },
          lastError: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // 3 scrapers en parallèle max
    limiter: {
      max: 10, // 10 jobs max
      duration: 60000 // par minute
    }
  }
);

// Gestion des événements
scrapingWorker.on('completed', (job) => {
  logger.info(`✅ Job ${job.id} completed`);
});

scrapingWorker.on('failed', (job, err) => {
  logger.error(`❌ Job ${job?.id} failed:`, err);
});

scrapingWorker.on('error', (err) => {
  logger.error('Worker error:', err);
});
```

```typescript
// api/src/workers/schedulers/scraping.scheduler.ts
import cron from 'node-cron';
import { prisma } from '@/shared/database/prisma.client';
import { scrapingQueue } from '@/infrastructure/queue/scraping.queue';
import { logger } from '@/infrastructure/logger';

/**
 * Scheduler qui vérifie toutes les 5 minutes si des sources
 * doivent être scrappées selon leur scrapingFrequency
 */
export function startScrapingScheduler() {
  logger.info('🕐 Starting scraping scheduler (every 5 minutes)');
  
  cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('⏰ Checking sources for scheduled scraping');
      
      // Récupérer toutes les sources actives
      const sources = await prisma.source.findMany({
        where: { isActive: true }
      });
      
      const now = Date.now();
      let queued = 0;
      
      for (const source of sources) {
        const lastScraped = source.lastScrapedAt?.getTime() || 0;
        const frequency = source.scrapingFrequency * 1000; // Convertir en ms
        const nextScrape = lastScraped + frequency;
        
        // Si c'est le moment de scraper
        if (now >= nextScrape) {
          logger.info(`📬 Queueing scraping for source ${source.id} (${source.name})`);
          
          await scrapingQueue.add(
            'scrape-source',
            { sourceId: source.id, force: false },
            {
              jobId: `scrape-${source.id}-${Date.now()}`,
              removeOnComplete: 100, // Garder les 100 derniers jobs
              removeOnFail: 50
            }
          );
          
          queued++;
        }
      }
      
      if (queued > 0) {
        logger.info(`✅ Queued ${queued} scraping jobs`);
      }
      
    } catch (error) {
      logger.error('❌ Scheduler error:', error);
    }
  });
}
```

```typescript
// api/src/workers/index.ts
import { scrapingWorker } from './processors/scraping.processor';
import { startScrapingScheduler } from './schedulers/scraping.scheduler';
import { logger } from '@/infrastructure/logger';

async function startWorkers() {
  logger.info('🚀 Starting workers...');
  
  // Démarrer le worker de scraping
  logger.info('✅ Scraping worker started');
  
  // Démarrer le scheduler
  startScrapingScheduler();
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing workers...');
    await scrapingWorker.close();
    process.exit(0);
  });
}

startWorkers().catch((error) => {
  logger.error('Failed to start workers:', error);
  process.exit(1);
});
```

**Étape 1.1.2 : Ajouter script dans package.json**

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "workers": "tsx watch src/workers/index.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run workers\""
  }
}
```

**Étape 1.1.3 : Tester**

```bash
# Terminal 1 : API
npm run dev

# Terminal 2 : Workers
npm run workers

# Terminal 3 : Créer une source et vérifier le scraping
curl -X POST http://localhost:5001/api/v1/sources \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "...",
    "type": "TRUSTPILOT",
    "name": "Test Source",
    "config": { "companyName": "example.com" }
  }'

# Vérifier les logs du worker
# Devrait voir : "🚀 Starting scraping job for source ..."
```

**Critères de validation:**
- ✅ Worker démarre sans erreur
- ✅ Scheduler tourne toutes les 5 minutes
- ✅ Création de source déclenche un scraping immédiat
- ✅ Scraping récurrent fonctionne selon scrapingFrequency

---

### Tâche 1.2 : Ajouter Pagination Partout ⏱️ 1 jour

**Priorité:** 🔴 P0 - CRITIQUE  
**Impact:** Risque de timeout et crash avec gros volumes  
**Effort:** 1 jour

#### Problème Actuel
```typescript
// ❌ Aucune pagination
async getMentions(filters) {
  return await prisma.mention.findMany({ where: filters });
  // Peut retourner 100,000+ mentions → Timeout
}
```

#### Solution

**Étape 1.2.1 : Créer utilitaire de pagination**

```typescript
// api/src/shared/utils/pagination.ts
import { Prisma } from '@prisma/client';

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
  params: PaginationParams,
  include?: any
): Promise<PaginatedResponse<T>> {
  // Valider et normaliser les paramètres
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;
  
  // Construire l'orderBy
  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = params.sortOrder || 'desc';
  } else {
    orderBy.createdAt = 'desc'; // Par défaut
  }
  
  // Exécuter les requêtes en parallèle
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include
    }),
    model.count({ where })
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

// Helper pour extraire les params de pagination depuis req.query
export function extractPaginationParams(query: any): PaginationParams {
  return {
    page: query.page ? parseInt(query.page) : 1,
    limit: query.limit ? parseInt(query.limit) : 20,
    sortBy: query.sortBy as string,
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc'
  };
}
```

**Étape 1.2.2 : Appliquer à tous les modules**

```typescript
// api/src/modules/mentions/mentions.service.ts
import { paginate, PaginationParams, PaginatedResponse } from '@/shared/utils/pagination';

class MentionsService {
  async getMentions(
    filters: any,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Mention>> {
    return await paginate(
      prisma.mention,
      filters,
      pagination,
      { brand: true, source: true } // include
    );
  }
}

// api/src/modules/mentions/mentions.controller.ts
import { extractPaginationParams } from '@/shared/utils/pagination';

class MentionsController {
  async getMentions(req: Request, res: Response) {
    const user = req.user;
    const { brandId, sentiment } = req.query;
    
    // Extraire pagination
    const pagination = extractPaginationParams(req.query);
    
    // Construire filtres
    const filters: any = {
      brand: { organizationId: user.organizationId }
    };
    
    if (brandId) filters.brandId = brandId;
    if (sentiment) filters.sentiment = sentiment;
    
    // Appeler service avec pagination
    const result = await mentionsService.getMentions(filters, pagination);
    
    res.json({
      success: true,
      ...result
    });
  }
}
```

**Modules à mettre à jour:**
- ✅ mentions (GET /mentions)
- ✅ sources (GET /sources)
- ✅ brands (GET /brands)
- ✅ alerts (GET /alerts)
- ✅ keywords (GET /keywords)
- ✅ actions (GET /actions)
- ✅ reports (GET /reports)
- ✅ users (GET /users)

**Étape 1.2.3 : Tester**

```bash
# Sans pagination (devrait utiliser défauts)
curl "http://localhost:5001/api/v1/mentions?brandId=xxx"

# Avec pagination
curl "http://localhost:5001/api/v1/mentions?brandId=xxx&page=2&limit=50"

# Avec tri
curl "http://localhost:5001/api/v1/mentions?sortBy=publishedAt&sortOrder=asc"
```

**Critères de validation:**
- ✅ Toutes les routes GET retournent `{ data: [], pagination: {} }`
- ✅ Limite max de 100 items par page
- ✅ Tri fonctionne (asc/desc)
- ✅ Performance : <500ms pour 10,000+ records

---

### Tâche 1.3 : Corriger Isolation des Données ⏱️ 1 jour

**Priorité:** 🔴 P0 - CRITIQUE (SÉCURITÉ)  
**Impact:** Faille de sécurité permettant l'accès aux données d'autres organisations  
**Effort:** 1 jour

#### Problème Actuel
```typescript
// ❌ Module Actions : Pas de filtrage par organization
async getAllActions(req: Request, res: Response) {
  const actions = await prisma.action.findMany();
  // ⚠️ Retourne TOUTES les actions, même celles d'autres orgs
}
```

#### Solution

**Étape 1.3.1 : Créer middleware de vérification d'ownership**

```typescript
// api/src/shared/middleware/ownership.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/shared/database/prisma.client';
import { AppError } from '@/shared/utils/errors';

/**
 * Vérifie que la ressource appartient à l'organisation de l'utilisateur
 */
export function requireOwnership(resourceType: string, idParam = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params[idParam];
      const user = req.user;
      
      if (!resourceId) {
        return next();
      }
      
      // Mapper le type de ressource au modèle Prisma
      const modelMap: Record<string, any> = {
        'brand': prisma.brand,
        'source': prisma.source,
        'mention': prisma.mention,
        'alert': prisma.alert,
        'action': prisma.action,
        'report': prisma.report,
        'keyword': prisma.keyword
      };
      
      const model = modelMap[resourceType];
      if (!model) {
        throw new AppError(`Unknown resource type: ${resourceType}`, 500);
      }
      
      // Construire la requête selon le type
      let resource;
      
      if (resourceType === 'brand') {
        resource = await model.findFirst({
          where: {
            id: resourceId,
            organizationId: user.organizationId
          }
        });
      } else if (['source', 'mention', 'alert', 'report'].includes(resourceType)) {
        resource = await model.findFirst({
          where: {
            id: resourceId,
            brand: { organizationId: user.organizationId }
          }
        });
      } else if (resourceType === 'action') {
        // Actions peuvent être assignées à un user
        resource = await model.findFirst({
          where: {
            id: resourceId,
            OR: [
              { assignedTo: { organizationId: user.organizationId } },
              { assignedToId: user.userId }
            ]
          }
        });
      }
      
      if (!resource) {
        throw new AppError(
          `${resourceType} not found or access denied`,
          404,
          'RESOURCE_NOT_FOUND'
        );
      }
      
      // Attacher la ressource à req pour éviter de la recharger
      req.resource = resource;
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
```

**Étape 1.3.2 : Appliquer aux routes**

```typescript
// api/src/modules/actions/actions.routes.ts
import { requireOwnership } from '@/shared/middleware/ownership.middleware';

const router = Router();

// Toutes les routes nécessitent auth
router.use(requireAuth);

// GET /actions - Filtrer par organization
router.get('/', actionsController.getAllActions);

// Routes avec :id - Vérifier ownership
router.get('/:id', 
  requireOwnership('action'),
  actionsController.getActionById
);

router.patch('/:id',
  requireOwnership('action'),
  actionsController.updateAction
);

router.delete('/:id',
  requireOwnership('action'),
  actionsController.deleteAction
);
```

```typescript
// api/src/modules/actions/actions.controller.ts
class ActionsController {
  async getAllActions(req: Request, res: Response) {
    const user = req.user;
    
    // ✅ CORRECT : Filtrer par organization
    const actions = await prisma.action.findMany({
      where: {
        OR: [
          { assignedTo: { organizationId: user.organizationId } },
          { assignedToId: user.userId }
        ]
      },
      include: { assignedTo: true }
    });
    
    res.json({ success: true, data: actions });
  }
  
  async getActionById(req: Request, res: Response) {
    // ✅ Ressource déjà vérifiée par middleware
    const action = req.resource;
    res.json({ success: true, data: action });
  }
}
```

**Modules à corriger:**
- 🔴 actions (CRITIQUE)
- 🟠 mentions (vérifier)
- 🟠 sources (vérifier)
- 🟠 alerts (vérifier)

**Étape 1.3.3 : Tests de sécurité**

```typescript
// api/src/__tests__/security/isolation.test.ts
describe('Data Isolation', () => {
  it('should not allow access to other org actions', async () => {
    // Créer 2 organisations
    const org1 = await createOrg('Org 1');
    const org2 = await createOrg('Org 2');
    
    // Créer une action pour org2
    const action = await prisma.action.create({
      data: {
        title: 'Secret Action',
        assignedTo: { connect: { id: org2.ownerId } }
      }
    });
    
    // User de org1 essaie d'accéder
    const response = await request(app)
      .get(`/api/v1/actions/${action.id}`)
      .set('Authorization', `Bearer ${org1Token}`);
    
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
  });
});
```

**Critères de validation:**
- ✅ Impossible d'accéder aux ressources d'une autre org
- ✅ GET /actions ne retourne que les actions de l'org
- ✅ GET /actions/:id retourne 404 si autre org
- ✅ Tests de sécurité passent

---

### Tâche 1.4 : Batch Processing Scrapers ⏱️ 1 jour

**Priorité:** 🔴 P0 - CRITIQUE (PERFORMANCE)  
**Impact:** Performance x10 sur l'insertion de mentions  
**Effort:** 1 jour

#### Problème Actuel
```python
# ❌ 1 query + 1 commit par item
for item in items:
    self.cur.execute(query, ...)
    self.conn.commit()
    
# 10,000 items = 10,000 queries = 5-10 minutes
```

#### Solution

```python
# scrapers/sentinelle_scrapers/pipelines.py
import json
import logging
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values
from scrapy.exceptions import DropItem

class DatabasePipeline:
    """
    PostgreSQL Pipeline avec batch processing
    """
    def __init__(self, db_config):
        self.db_config = db_config
        self.logger = logging.getLogger(__name__)
        self.items_buffer = []
        self.buffer_size = 100  # Flush tous les 100 items
    
    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            db_config={
                'host': os.getenv('DB_HOST', 'localhost'),
                'database': os.getenv('DB_NAME', 'sentinelle'),
                'user': os.getenv('DB_USER', 'postgres'),
                'password': os.getenv('DB_PASSWORD', ''),
                'port': os.getenv('DB_PORT', '5432'),
            }
        )
    
    def open_spider(self, spider):
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cur = self.conn.cursor()
            self.logger.info("✅ Connected to PostgreSQL")
        except Exception as e:
            self.logger.error(f"❌ Database connection failed: {e}")
            self.conn = None
    
    def close_spider(self, spider):
        # Flush remaining items
        if self.items_buffer:
            self.flush_buffer()
        
        if hasattr(self, 'conn') and self.conn:
            self.cur.close()
            self.conn.close()
            self.logger.info("✅ Database connection closed")
    
    def process_item(self, item, spider):
        if not hasattr(self, 'conn') or not self.conn:
            return item
        
        source_id = item.get('source_id')
        if not source_id:
            self.logger.error("❌ Missing source_id in item. Skipping.")
            raise DropItem("Missing source_id")
        
        # Ajouter au buffer
        self.items_buffer.append({
            'source_id': source_id,
            'platform': item.get('platform'),
            'author': item.get('author', 'Anonyme'),
            'content': item.get('content'),
            'url': item.get('url', ''),
            'published_at': item.get('published_at'),
            'scraped_at': item.get('scraped_at', datetime.now().isoformat()),
            'external_id': item.get('external_id'),
            'rating': item.get('rating'),
            'metadata': json.dumps(item.get('metadata', {}))
        })
        
        # Flush si buffer plein
        if len(self.items_buffer) >= self.buffer_size:
            self.flush_buffer()
        
        return item
    
    def flush_buffer(self):
        """
        Insère tous les items du buffer en une seule requête
        """
        if not self.items_buffer:
            return
        
        try:
            # 1. Récupérer tous les brandIds en une requête
            source_ids = list(set(item['source_id'] for item in self.items_buffer))
            
            self.cur.execute(
                'SELECT id, "brandId" FROM sources WHERE id = ANY(%s)',
                (source_ids,)
            )
            
            source_to_brand = {row[0]: row[1] for row in self.cur.fetchall()}
            
            # 2. Préparer les valeurs pour batch insert
            values = []
            for item in self.items_buffer:
                brand_id = source_to_brand.get(item['source_id'])
                if not brand_id:
                    self.logger.warning(f"⚠️ Source {item['source_id']} not found, skipping")
                    continue
                
                values.append((
                    brand_id,
                    item['source_id'],
                    item['platform'],
                    item['author'],
                    item['content'],
                    item['url'],
                    item['published_at'],
                    item['scraped_at'],
                    item['external_id'],
                    item['rating'],
                    item['metadata']
                ))
            
            if not values:
                self.logger.warning("⚠️ No valid items to insert")
                self.items_buffer = []
                return
            
            # 3. Batch insert avec ON CONFLICT
            query = """
                INSERT INTO mentions (
                    "brandId", "sourceId", platform, author, content,
                    url, "publishedAt", "scrapedAt", sentiment, "externalId",
                    "rawData"
                ) VALUES %s
                ON CONFLICT ("externalId", platform) DO UPDATE SET
                    content = EXCLUDED.content,
                    "publishedAt" = EXCLUDED."publishedAt",
                    "scrapedAt" = EXCLUDED."scrapedAt"
            """
            
            # Utiliser execute_values pour batch insert
            execute_values(
                self.cur,
                query,
                values,
                template="(%s, %s, %s, %s, %s, %s, %s, %s, 'NEUTRAL', %s, %s)",
                page_size=100
            )
            
            self.conn.commit()
            
            self.logger.info(f"💾 Batch inserted {len(values)} mentions")
            
        except Exception as e:
            self.logger.error(f"❌ Batch insert failed: {e}")
            self.conn.rollback()
        finally:
            # Vider le buffer
            self.items_buffer = []
```

**Étape 1.4.2 : Tester la performance**

```python
# scrapers/test_batch_performance.py
import time
import psycopg2
from psycopg2.extras import execute_values

def test_single_insert(conn, items):
    """Méthode actuelle (lente)"""
    cur = conn.cursor()
    start = time.time()
    
    for item in items:
        cur.execute("INSERT INTO mentions (...) VALUES (%s, %s, ...)", item)
        conn.commit()
    
    duration = time.time() - start
    print(f"Single insert: {duration:.2f}s for {len(items)} items")
    return duration

def test_batch_insert(conn, items):
    """Méthode optimisée (rapide)"""
    cur = conn.cursor()
    start = time.time()
    
    execute_values(cur, "INSERT INTO mentions (...) VALUES %s", items)
    conn.commit()
    
    duration = time.time() - start
    print(f"Batch insert: {duration:.2f}s for {len(items)} items")
    return duration

# Résultats attendus:
# Single insert: 45.23s for 1000 items
# Batch insert: 1.12s for 1000 items
# Amélioration: 40x plus rapide
```

**Critères de validation:**
- ✅ Batch insert fonctionne
- ✅ Performance : <5s pour 10,000 items (vs 5min avant)
- ✅ ON CONFLICT fonctionne (pas de doublons)
- ✅ Pas de perte de données

---

### Tâche 1.5 : Validation Zod Systématique ⏱️ 1 jour

**Priorité:** 🟠 P1 - IMPORTANT  
**Impact:** Prévention des erreurs runtime et données invalides  
**Effort:** 1 jour

#### Problème Actuel
```typescript
// ❌ Validation manuelle incohérente
if (!brandId || !type || !name) {
  res.status(400).json({ error: 'Missing fields' });
}

// ❌ Pas de validation de format
const email = req.body.email; // Peut être n'importe quoi
```

#### Solution

**Étape 1.5.1 : Créer schémas Zod centralisés**

```typescript
// shared/validators/schemas.ts
import { z } from 'zod';

// ========== AUTH ==========
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court (min 8 caractères)'),
  name: z.string().min(2, 'Nom trop court').optional(),
  organizationName: z.string().min(2, 'Nom d\'organisation requis')
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

// ========== SOURCES ==========
export const createSourceSchema = z.object({
  brandId: z.string().cuid('Brand ID invalide'),
  type: z.enum([
    'TRUSTPILOT', 'GOOGLE_REVIEWS', 'NEWS', 'BLOG', 
    'FORUM', 'RSS', 'REVIEW', 'OTHER'
  ]),
  name: z.string().min(3, 'Nom trop court').max(100, 'Nom trop long'),
  config: z.object({
    companyName: z.string().optional(),
    url: z.string().url('URL invalide').optional(),
    apiKey: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }),
  scrapingFrequency: z.number().int().min(1800).max(86400).optional()
    .describe('Fréquence en secondes (30min - 24h)')
});

export const updateSourceSchema = createSourceSchema.partial();

// ========== MENTIONS ==========
export const createMentionSchema = z.object({
  brandId: z.string().cuid(),
  sourceId: z.string().cuid(),
  content: z.string().min(1).max(10000),
  author: z.string().max(255),
  url: z.string().url(),
  publishedAt: z.string().datetime().or(z.date()),
  platform: z.string(),
  externalId: z.string(),
  sentiment: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED']).optional()
});

export const searchMentionsSchema = z.object({
  brandId: z.string().cuid().optional(),
  sentiment: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  keywords: z.array(z.string()).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional()
});

// ========== BRANDS ==========
export const createBrandSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  keywords: z.array(z.string()).max(50)
});

// ========== ALERTS ==========
export const createAlertSchema = z.object({
  brandId: z.string().cuid(),
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  condition: z.enum([
    'NEGATIVE_SENTIMENT_THRESHOLD',
    'KEYWORD_FREQUENCY',
    'MENTION_SPIKE',
    'SENTIMENT_DROP',
    'CUSTOM'
  ]),
  threshold: z.number().min(0).max(100),
  level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
});

// ========== ACTIONS ==========
export const createActionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().cuid().optional(),
  tags: z.array(z.string()).max(10).optional()
});
```

**Étape 1.5.2 : Appliquer aux routes**

```typescript
// Tous les modules
import { validate } from '@/shared/middleware/validate.middleware';
import { createSourceSchema, updateSourceSchema } from '@/shared/validators/schemas';

router.post('/',
  requireAuth,
  validate(createSourceSchema),
  sourcesController.createSource
);

router.patch('/:id',
  requireAuth,
  validate(updateSourceSchema),
  sourcesController.updateSource
);
```

**Modules à mettre à jour:**
- ✅ sources
- ✅ mentions
- ✅ brands
- ✅ alerts
- ✅ actions
- ✅ keywords
- ✅ reports

**Critères de validation:**
- ✅ Toutes les routes POST/PATCH ont validate()
- ✅ Erreurs 422 avec détails clairs
- ✅ Pas d'erreurs runtime dues à données invalides

---

## 🟠 PHASE 2 : AMÉLIORATIONS IMPORTANTES (Semaine 2)

### Tâche 2.1 : Repository Pattern ⏱️ 2 jours

**Priorité:** 🟡 P2 - MOYEN  
**Impact:** Meilleure maintenabilité et testabilité  
**Effort:** 2 jours

#### Objectif
Séparer la logique d'accès aux données (DB) de la logique métier

#### Structure Cible

```typescript
// api/src/modules/mentions/mentions.repository.ts
export class MentionsRepository {
  async findById(id: string) {
    return prisma.mention.findUnique({
      where: { id },
      include: { brand: true, source: true }
    });
  }
  
  async findByBrand(brandId: string, filters: any) {
    return prisma.mention.findMany({
      where: { brandId, ...filters },
      include: { brand: true, source: true }
    });
  }
  
  async create(data: CreateMentionDTO) {
    return prisma.mention.create({ data });
  }
  
  async update(id: string, data: Partial<CreateMentionDTO>) {
    return prisma.mention.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return prisma.mention.delete({ where: { id } });
  }
  
  async countByBrand(brandId: string) {
    return prisma.mention.count({ where: { brandId } });
  }
  
  async findBySentiment(brandId: string, sentiment: string) {
    return prisma.mention.findMany({
      where: { brandId, sentiment }
    });
  }
}

// api/src/modules/mentions/mentions.service.ts
export class MentionsService {
  constructor(private repo: MentionsRepository) {}
  
  async getMentions(brandId: string, filters: any) {
    // Logique métier
    const mentions = await this.repo.findByBrand(brandId, filters);
    
    // Enrichissement, transformations, etc.
    return mentions.map(m => this.enrichMention(m));
  }
  
  private enrichMention(mention: Mention) {
    // Logique métier
    return {
      ...mention,
      sentimentLabel: this.getSentimentLabel(mention.sentiment)
    };
  }
}
```

**Modules à refactorer:**
- mentions
- sources
- brands
- alerts

---

### Tâche 2.2 : Rate Limiting par Utilisateur ⏱️ 1 jour

**Priorité:** 🟠 P1 - IMPORTANT (SÉCURITÉ)  
**Impact:** Prévention des abus  
**Effort:** 1 jour

```typescript
// api/src/shared/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '@/config/redis';

export const userRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par utilisateur
  keyGenerator: (req) => {
    // Utiliser userId si authentifié, sinon IP
    return req.user?.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Trop de requêtes. Réessayez dans 15 minutes.'
      }
    });
  }
});

// Appliquer globalement
app.use('/api/v1', userRateLimiter);
```

---

### Tâche 2.3 : Monitoring & Alertes ⏱️ 2 jours

**Priorité:** 🟠 P1 - IMPORTANT  
**Impact:** Détection proactive des problèmes  
**Effort:** 2 jours

```typescript
// api/src/infrastructure/monitoring/prometheus.ts
import promClient from 'prom-client';

// Métriques
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

export const scrapingJobsTotal = new promClient.Counter({
  name: 'scraping_jobs_total',
  help: 'Total number of scraping jobs',
  labelNames: ['status', 'source_type']
});

export const mentionsCreated = new promClient.Counter({
  name: 'mentions_created_total',
  help: 'Total number of mentions created'
});

// Endpoint metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

### Tâche 2.4 : Tests Automatisés ⏱️ 3 jours

**Priorité:** 🟡 P2 - MOYEN  
**Impact:** Prévention des régressions  
**Effort:** 3 jours

```typescript
// api/src/__tests__/integration/sources.test.ts
describe('Sources API', () => {
  it('should create a source', async () => {
    const response = await request(app)
      .post('/api/v1/sources')
      .set('Authorization', `Bearer ${token}`)
      .send({
        brandId: testBrand.id,
        type: 'TRUSTPILOT',
        name: 'Test Source',
        config: { companyName: 'example.com' }
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Test Source');
  });
  
  it('should trigger scraping on creation', async () => {
    // Vérifier que le job est dans la queue
    const jobs = await scrapingQueue.getJobs(['waiting']);
    expect(jobs.length).toBeGreaterThan(0);
  });
});
```

**Couverture cible:**
- ✅ Auth (login, register, JWT)
- ✅ Sources (CRUD + scraping)
- ✅ Mentions (CRUD + pagination)
- ✅ Sécurité (isolation, ownership)

---

## 🟡 PHASE 3 : OPTIMISATIONS (Semaine 3)

### Tâche 3.1 : Caching Redis ⏱️ 2 jours

```typescript
// api/src/infrastructure/cache/redis.service.ts
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any, ttl = 3600) {
    await redisClient.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string) {
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(...keys);
  }
}

// Utilisation
async getAnalyticsSummary(brandId: string) {
  const cacheKey = `analytics:summary:${brandId}`;
  
  // Vérifier cache
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;
  
  // Calculer
  const summary = await this.calculateSummary(brandId);
  
  // Mettre en cache (15 minutes)
  await cacheService.set(cacheKey, summary, 900);
  
  return summary;
}
```

---

### Tâche 3.2 : Database Indexes ⏱️ 1 jour

```sql
-- Indexes pour performance
CREATE INDEX CONCURRENTLY idx_mentions_brand_sentiment_date
ON mentions(brandId, sentiment, publishedAt DESC);

CREATE INDEX CONCURRENTLY idx_mentions_search
ON mentions USING gin(to_tsvector('french', content));

CREATE INDEX CONCURRENTLY idx_sources_active_frequency
ON sources(isActive, scrapingFrequency) WHERE isActive = true;

-- Analyser les requêtes lentes
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

### Tâche 3.3 : Archivage Automatique ⏱️ 2 jours

```typescript
// api/src/workers/jobs/archiving.job.ts
cron.schedule('0 2 * * *', async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  // Archiver vers S3
  const oldMentions = await prisma.mention.findMany({
    where: { createdAt: { lt: sixMonthsAgo } },
    take: 10000
  });
  
  if (oldMentions.length > 0) {
    await s3.upload({
      Bucket: 'sentinelle-archive',
      Key: `mentions-${Date.now()}.json.gz`,
      Body: gzip(JSON.stringify(oldMentions))
    });
    
    // Supprimer de la DB
    await prisma.mention.deleteMany({
      where: {
        id: { in: oldMentions.map(m => m.id) }
      }
    });
    
    logger.info(`Archived ${oldMentions.length} old mentions`);
  }
});
```

---

## 📊 TABLEAU DE BORD DU PROJET

### Checklist Globale

#### 🔴 Phase 1 : Corrections Critiques (Semaine 1)
- [ ] 1.1 Workers BullMQ (2j)
- [ ] 1.2 Pagination (1j)
- [ ] 1.3 Isolation données (1j)
- [ ] 1.4 Batch processing (1j)
- [ ] 1.5 Validation Zod (1j)

#### 🟠 Phase 2 : Améliorations (Semaine 2)
- [ ] 2.1 Repository pattern (2j)
- [ ] 2.2 Rate limiting user (1j)
- [ ] 2.3 Monitoring (2j)
- [ ] 2.4 Tests automatisés (3j)

#### 🟡 Phase 3 : Optimisations (Semaine 3)
- [ ] 3.1 Caching Redis (2j)
- [ ] 3.2 Database indexes (1j)
- [ ] 3.3 Archivage auto (2j)

---

## 🎯 CRITÈRES DE SUCCÈS

### Avant Production

**Sécurité:**
- ✅ Toutes les routes protégées par requireAuth
- ✅ Isolation des données vérifiée (tests passent)
- ✅ Rate limiting par utilisateur actif
- ✅ Validation Zod sur tous les inputs

**Performance:**
- ✅ Pagination sur toutes les routes GET
- ✅ Temps de réponse <500ms (95e percentile)
- ✅ Batch processing scrapers (>10x plus rapide)
- ✅ Indexes DB optimisés

**Fiabilité:**
- ✅ Workers automatiques fonctionnels
- ✅ Scraping récurrent opérationnel
- ✅ Gestion d'erreurs robuste (retry, logs)
- ✅ Tests de couverture >70%

**Monitoring:**
- ✅ Métriques Prometheus exposées
- ✅ Logs structurés (JSON)
- ✅ Alertes configurées (downtime, erreurs)

---

## 📞 SUPPORT & RESSOURCES

### Documentation
- Architecture complète : `ARCHITECTURE_ANALYSIS.md`
- Plan d'action : `ACTION_PLAN.md` (ce fichier)
- README : `README.md`

### Commandes Utiles

```bash
# Démarrer tout en dev
npm run dev:all

# Workers seuls
npm run workers

# Tests
npm test

# Vérifier la queue Redis
redis-cli
> KEYS scraping:*
> LLEN scraping:waiting

# Vérifier les jobs en DB
psql -d sentinelle -c "SELECT * FROM scraping_jobs ORDER BY createdAt DESC LIMIT 10;"
```

### Contacts
- **Développeur:** [Votre nom]
- **Repo:** https://github.com/...
- **Docs API:** http://localhost:5001/api/v1/docs

---

**Dernière mise à jour:** 7 Février 2026
