/**
 * 🔍 SourceAnalyzer Routes
 * 
 * Routes pour l'analyse des sources
 */

import { Router } from 'express';
import { Logger } from 'winston';
import { PrismaClient } from '@sentinelle/database';
import SourceAnalyzerController from './source-analyzer.controller';

/**
 * Crée les routes d'analyse des sources
 */
export function createSourceAnalyzerRoutes(
  prisma: PrismaClient,
  logger: Logger
): Router {
  const router: Router = Router();
  const controller = new SourceAnalyzerController(prisma, logger);

  // GET /api/sources/analyze-docs - Documentation
  router.get('/analyze-docs', (req, res) => controller.getDocs(req, res));

  // POST /api/sources/analyze - Analyser une URL unique
  router.post('/analyze', (req, res) => controller.analyzeUrl(req, res));

  // POST /api/sources/analyze/batch - Analyser plusieurs URLs
  router.post('/analyze/batch', (req, res) => controller.analyzeBatch(req, res));

  // POST /api/sources/analyze-and-create - Analyser et créer une source
  router.post('/analyze-and-create', (req, res) => controller.analyzeAndCreate(req, res));

  return router;
}

export default createSourceAnalyzerRoutes;

