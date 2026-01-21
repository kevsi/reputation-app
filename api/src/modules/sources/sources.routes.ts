// src/modules/sources/sources.routes.ts

import { Router } from 'express';
import { sourcesController } from './sources.controller';

/**
 * 🛣️ Routes Sources
 * 
 * Définit toutes les routes HTTP pour les sources
 */
const router = Router();

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
 * Sinon "active" serait interprété comme un ID
 */
router.get('/active', sourcesController.getActiveSources.bind(sourcesController));

/**
 * GET /api/v1/sources/:id
 * Récupère une source par son ID
 */
router.get('/:id', sourcesController.getSourceById.bind(sourcesController));

/**
 * POST /api/v1/sources/:id/scrape-now
 * Déclenche un scraping immédiat (enqueue un job côté workers)
 */
router.post('/:id/scrape-now', sourcesController.scrapeNow.bind(sourcesController));

/**
 * POST /api/v1/sources
 * Crée une nouvelle source
 */
router.post('/', sourcesController.createSource.bind(sourcesController));

/**
 * PATCH /api/v1/sources/:id
 * Met à jour une source existante (partiellement)
 */
router.patch('/:id', sourcesController.updateSource.bind(sourcesController));

/**
 * DELETE /api/v1/sources/:id
 * Supprime une source
 */
router.delete('/:id', sourcesController.deleteSource.bind(sourcesController));

export default router;