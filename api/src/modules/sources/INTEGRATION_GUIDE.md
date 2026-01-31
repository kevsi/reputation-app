/**
 * 📝 Exemple d'Intégration - Comment ajouter SourceAnalyzer à app.ts
 * 
 * Ce fichier montre comment intégrer SourceAnalyzer dans votre application Express
 */

// ============================================================================
// ÉTAPE 1: Importer les modules
// ============================================================================

// Dans api/src/app.ts (exemple)
import express, { Express } from 'express';
import { PrismaClient } from '@sentinelle/database';
import logger from '@/infrastructure/logging';
import createSourceAnalyzerRoutes from '@/modules/sources/source-analyzer.routes';
import createSourceRoutes from '@/modules/sources'; // Routes sources existantes

// ============================================================================
// ÉTAPE 2: Créer l'application
// ============================================================================

const app: Express = express();
const prisma = new PrismaClient();

// ============================================================================
// ÉTAPE 3: Ajouter les routes SourceAnalyzer
// ============================================================================

/**
 * OPTION A: Ajouter SourceAnalyzer comme routes indépendantes
 */
export function setupApp(): Express {
  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes SourceAnalyzer (nouvelles)
  // Endpoints:
  // - POST /api/sources/analyze
  // - POST /api/sources/analyze/batch
  // - POST /api/sources/analyze-and-create
  // - GET /api/sources/analyze-docs
  app.use('/api/sources', createSourceAnalyzerRoutes(prisma, logger));

  // Routes sources existantes
  // Endpoints:
  // - POST /api/sources
  // - GET /api/sources
  // - GET /api/sources/:id
  // - PUT /api/sources/:id
  // - DELETE /api/sources/:id
  app.use('/api/sources', createSourceRoutes(prisma, logger));

  return app;
}

// ============================================================================
// OPTION B: Intégrer dans les routes sources existantes
// ============================================================================

/**
 * Si vous préférez intégrer SourceAnalyzer dans sources/index.ts:
 * 
 * // api/src/modules/sources/index.ts
 * 
 * import { Router } from 'express';
 * import { PrismaClient } from '@sentinelle/database';
 * import { Logger } from 'winston';
 * import createSourceAnalyzerRoutes from './source-analyzer.routes';
 * import SourcesController from './sources.controller';
 * 
 * export function createSourceRoutes(
 *   prisma: PrismaClient,
 *   logger: Logger
 * ): Router {
 *   const router = Router();
 *   const controller = new SourcesController(prisma, logger);
 * 
 *   // Routes d'analyse (NOUVELLES)
 *   router.use('/analyze', createSourceAnalyzerRoutes(prisma, logger));
 * 
 *   // Routes existantes
 *   router.post('/', (req, res) => controller.create(req, res));
 *   router.get('/', (req, res) => controller.list(req, res));
 *   router.get('/:id', (req, res) => controller.getById(req, res));
 *   router.put('/:id', (req, res) => controller.update(req, res));
 *   router.delete('/:id', (req, res) => controller.delete(req, res));
 * 
 *   return router;
 * }
 */

// ============================================================================
// ÉTAPE 4: Exemple de flux utilisateur complet
// ============================================================================

/**
 * Scénario: Un utilisateur veut ajouter une source
 * 
 * 1️⃣ Utilisateur entre une URL
 *    Input: https://blog.example.com/articles
 * 
 * 2️⃣ Frontend appelle: POST /api/sources/analyze
 *    {
 *      "url": "https://blog.example.com/articles",
 *      "includeDebugLogs": false
 *    }
 * 
 * 3️⃣ Backend analyse l'URL
 *    SourceAnalyzer.analyze(url)
 *    → Détecte: SCRAPABLE
 *    → Status: 200
 *    → hasContent: true
 *    → blockageType: NONE
 * 
 * 4️⃣ Backend retourne les suggestions
 *    Response: {
 *      "diagnostic": {
 *        "strategy": "SCRAPABLE",
 *        "message": "Cette source peut être scrappée directement...",
 *        "recommendations": [...]
 *      },
 *      "suggestedSourceType": "BLOG",
 *      "suggestedConfig": {
 *        "url": "https://blog.example.com/articles",
 *        "scrapingFrequency": 21600
 *      },
 *      "requiresUserAction": false
 *    }
 * 
 * 5️⃣ Frontend affiche les informations et sugère une création
 *    "Créer une source pour scraper ce blog toutes les 6 heures?"
 * 
 * 6️⃣ Utilisateur valide, frontend appelle:
 *    POST /api/sources/analyze-and-create
 *    {
 *      "url": "https://blog.example.com/articles",
 *      "brandId": "550e8400-...",
 *      "name": "Mon Blog Tech"
 *    }
 * 
 * 7️⃣ Backend crée la source
 *    Source.create({
 *      type: 'BLOG',
 *      url: 'https://...',
 *      config: {
 *        url: '...',
 *        analysisMeta: {
 *          blockageDetected: 'NONE',
 *          isJavaScriptOnly: false
 *        }
 *      }
 *    })
 * 
 * 8️⃣ Response avec source créée
 *    {
 *      "source": {
 *        "id": "uuid",
 *        "name": "Mon Blog Tech",
 *        "type": "BLOG",
 *        "url": "https://...",
 *        "createdAt": "2026-01-28T10:30:00Z",
 *        ...
 *      },
 *      "created": true
 *    }
 * 
 * 9️⃣ Worker scraping.processor démarre le scraping
 *    → Lire la source
 *    → Checker analysisMeta
 *    → Utiliser Cheerio (puisque pas JS-only)
 *    → Chercher les mentions avec les keywords
 *    → Stocker en BD
 * 
 * 🔟 Mentions visibles dans le dashboard
 *    GET /api/mentions?brandId=...
 */

// ============================================================================
// ÉTAPE 5: Ajouter l'authentification (optionnel)
// ============================================================================

/**
 * Si vous voulez protéger les endpoints:
 * 
 * // api/src/modules/sources/source-analyzer.routes.ts
 * 
 * import { requireAuth } from '@/infrastructure/middleware';
 * 
 * export function createSourceAnalyzerRoutes(...): Router {
 *   const router = Router();
 * 
 *   // Protéger les endpoints
 *   router.use(requireAuth);
 * 
 *   router.post('/analyze', ...);
 *   router.post('/analyze/batch', ...);
 *   router.post('/analyze-and-create', ...);
 *   router.get('/analyze-docs', ...);
 * 
 *   return router;
 * }
 */

// ============================================================================
// ÉTAPE 6: Ajouter les validations Zod
// ============================================================================

/**
 * Pour ajouter une validation stricte:
 * 
 * // api/src/modules/sources/source-analyzer.schemas.ts
 * 
 * import { z } from 'zod';
 * 
 * export const AnalyzeUrlSchema = z.object({
 *   url: z.string().url('URL invalide'),
 *   includeDebugLogs: z.boolean().default(false)
 * });
 * 
 * export const AnalyzeAndCreateSchema = z.object({
 *   url: z.string().url('URL invalide'),
 *   brandId: z.string().uuid('Invalid brand ID'),
 *   name: z.string().optional(),
 *   organizationId: z.string().uuid().optional()
 * });
 * 
 * // Dans le contrôleur:
 * async analyzeUrl(req: Request, res: Response) {
 *   try {
 *     const validated = AnalyzeUrlSchema.parse(req.body);
 *     // ...
 *   } catch (error) {
 *     res.status(400).json({ error: 'Validation failed' });
 *   }
 * }
 */

// ============================================================================
// ÉTAPE 7: Ajouter le rate limiting
// ============================================================================

/**
 * Pour éviter les abus:
 * 
 * // api/src/app.ts
 * 
 * import rateLimit from 'express-rate-limit';
 * 
 * const analyzerLimiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100, // 100 requêtes par 15 minutes
 *   message: 'Trop de requêtes d\'analyse, veuillez réessayer plus tard'
 * });
 * 
 * app.use('/api/sources/analyze', analyzerLimiter);
 */

// ============================================================================
// ÉTAPE 8: Tests d'intégration
// ============================================================================

/**
 * Example de test d'intégration:
 * 
 * // api/src/modules/sources/source-analyzer.integration.test.ts
 * 
 * import request from 'supertest';
 * import { PrismaClient } from '@sentinelle/database';
 * import app from '@/app';
 * 
 * describe('SourceAnalyzer Integration', () => {
 *   let prisma: PrismaClient;
 * 
 *   beforeAll(() => {
 *     prisma = new PrismaClient();
 *   });
 * 
 *   it('devrait analyser une URL valide', async () => {
 *     const response = await request(app)
 *       .post('/api/sources/analyze')
 *       .send({ url: 'https://example.com' });
 * 
 *     expect(response.status).toBe(200);
 *     expect(response.body.data.diagnostic.strategy).toBeDefined();
 *   });
 * 
 *   it('devrait analyser et créer une source', async () => {
 *     const brand = await prisma.brand.create({...});
 * 
 *     const response = await request(app)
 *       .post('/api/sources/analyze-and-create')
 *       .send({
 *         url: 'https://example.com',
 *         brandId: brand.id
 *       });
 * 
 *     expect(response.status).toBe(201);
 *     expect(response.body.data.created).toBe(true);
 *   });
 * });
 */

// ============================================================================
// ÉTAPE 9: Monitoring et Métriques
// ============================================================================

/**
 * Pour tracker les analyses:
 * 
 * // api/src/modules/sources/source-analyzer.service.ts
 * 
 * private metrics = {
 *   totalAnalyses: 0,
 *   scrapableCount: 0,
 *   googleSearchCount: 0,
 *   apiRequiredCount: 0,
 *   unsupportedCount: 0,
 *   averageTime: 0
 * };
 * 
 * async analyzeUrl(url: string) {
 *   const startTime = Date.now();
 *   const result = await this.service.analyzeUrl(url);
 *   const duration = Date.now() - startTime;
 * 
 *   this.metrics.totalAnalyses++;
 *   this.metrics[`${result.diagnostic.strategy.toLowerCase()}Count`]++;
 *   this.updateAverageTime(duration);
 * 
 *   this.logger.info('Metrics updated', this.metrics);
 * 
 *   return result;
 * }
 * 
 * // GET /api/sources/analyze-metrics
 * getMetrics() {
 *   return this.metrics;
 * }
 */

// ============================================================================
// ÉTAPE 10: Documentation OpenAPI
// ============================================================================

/**
 * Pour Swagger/OpenAPI:
 * 
 * /**
 *  * @openapi
 *  * /api/sources/analyze:
 *  *   post:
 *  *     summary: Analyser une URL
 *  *     tags:
 *  *       - Sources
 *  *     requestBody:
 *  *       required: true
 *  *       content:
 *  *         application/json:
 *  *           schema:
 *  *             type: object
 *  *             properties:
 *  *               url:
 *  *                 type: string
 *  *                 example: https://example.com
 *  *               includeDebugLogs:
 *  *                 type: boolean
 *  *                 default: false
 *  *     responses:
 *  *       '200':
 *  *         description: Analyse complétée
 *  *       '400':
 *  *         description: URL invalide
 *  *       '500':
 *  *         description: Erreur serveur
 *  *\/
 */

export default app;
