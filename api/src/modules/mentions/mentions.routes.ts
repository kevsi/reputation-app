import { Router, Request, Response } from 'express';
import { mentionsController } from './mentions.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { prisma } from '@/shared/database/prisma.client';
import {
    createMentionSchema,
    updateMentionSchema,
    searchMentionsSchema,
    batchActionSchema
} from './mentions.validation';

const router = Router();

// PUBLIC TEST ENDPOINT (for debugging - remove in production)
router.get('/public-test', async (_req: Request, res: Response) => {
  try {
    const mentions = await prisma.mention.findMany({
      include: { brand: true, source: true },
      take: 100
    });
    res.status(200).json({ success: true, count: mentions.length, data: mentions });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Routes avancées (Post car plus de paramètres/souplesse)
router.post('/search', requireAuth, validate(searchMentionsSchema), mentionsController.search.bind(mentionsController));
router.post('/batch-action', requireAuth, validate(batchActionSchema), mentionsController.batchAction.bind(mentionsController));

// Route filtrée avec query params
router.get('/filtered', requireAuth, mentionsController.getMentions.bind(mentionsController));

// CRUD de base
router.get('/', requireAuth, mentionsController.getAllMentions.bind(mentionsController));
router.get('/:id', requireAuth, mentionsController.getMentionById.bind(mentionsController));
router.post('/', requireAuth, validate(createMentionSchema), mentionsController.createMention.bind(mentionsController));
router.patch('/:id', requireAuth, validate(updateMentionSchema), mentionsController.updateMention.bind(mentionsController));
router.delete('/:id', requireAuth, mentionsController.deleteMention.bind(mentionsController));

export default router;
