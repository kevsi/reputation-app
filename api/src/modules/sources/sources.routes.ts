// src/modules/sources/sources.routes.ts

import { Router } from 'express';
import { sourcesController } from './sources.controller';
import { requireAuth } from '@/shared/middleware/auth.middleware';

/**
 * 🛣️ Routes Sources
 * 
 * Définit toutes les routes HTTP pour les sources
 */
const router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

/**
 * GET /api/v1/sources
 * Récupère toutes les sources
 */
router.get('/', sourcesController.getAllSources.bind(sourcesController));

/**
 * GET /api/v1/sources/active
 * Récupère uniquement les sources actives
 * 
 * ⚠️ IMPORTANT : Cette route doit être AVANT /:id
 */
router.get('/active', sourcesController.getActiveSources.bind(sourcesController));

/**
 * POST /api/v1/sources/test
 * Teste la connexion à une plateforme
 */
router.post('/test', sourcesController.testConnection.bind(sourcesController));

/**
 * GET /api/v1/sources/:id
 * Récupère une source par son ID
 */
router.get('/:id', sourcesController.getSourceById.bind(sourcesController));

/**
 * POST /api/v1/sources/:id/scrape-now
 * Déclenche un scraping immédiat
 */
router.post('/:id/scrape-now', sourcesController.scrapeNow.bind(sourcesController));

/**
 * POST /api/v1/sources
 * Crée une nouvelle source avec validation credentials
 */
router.post('/', sourcesController.createSource.bind(sourcesController));

/**
 * PATCH /api/v1/sources/:id
 * Met à jour une source
 */
router.patch('/:id', sourcesController.updateSource.bind(sourcesController));

/**
 * DELETE /api/v1/sources/:id
 * Supprime une source
 */
router.delete('/:id', sourcesController.deleteSource.bind(sourcesController));

/**
 * DELETE /api/v1/sources/:id
 * Supprime une source
 */
router.delete('/:id', sourcesController.deleteSource.bind(sourcesController));

export default router;