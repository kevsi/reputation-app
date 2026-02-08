/**
 * Routes Sources
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import { Router } from 'express';
import { SourcesController } from './sources.controller';
import { requireAuth } from '@/shared/middleware/auth.middleware';
import { requireOwnership } from '@/shared/middleware/ownership.middleware';
import { validate } from '@/shared/middleware/validate.middleware';
import {
  createSourceSchema,
  updateSourceSchema,
  updateStatusSchema,
} from './sources.validation';

const router = Router();
const controller = new SourcesController();

router.use(requireAuth);

/**
 * GET /api/v1/sources/:sourceId
 * Récupérer une source par ID
 */
router.get(
  '/:sourceId',
  requireOwnership('source', 'sourceId'),
  controller.getById
);

/**
 * PATCH /api/v1/sources/:sourceId
 * Mettre à jour une source
 */
router.patch(
  '/:sourceId',
  requireOwnership('source', 'sourceId'),
  validate(updateSourceSchema),
  controller.update
);

/**
 * DELETE /api/v1/sources/:sourceId
 * Supprimer une source (soft delete)
 */
router.delete(
  '/:sourceId',
  requireOwnership('source', 'sourceId'),
  controller.delete
);

/**
 * PATCH /api/v1/sources/:sourceId/status
 * Changer le statut d'une source
 */
router.patch(
  '/:sourceId/status',
  requireOwnership('source', 'sourceId'),
  validate(updateStatusSchema),
  controller.updateStatus
);

/**
 * POST /api/v1/sources/:sourceId/scrape
 * Déclencher un scraping manuel
 */
router.post(
  '/:sourceId/scrape',
  requireOwnership('source', 'sourceId'),
  controller.triggerScraping
);

export default router;
