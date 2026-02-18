import { Router } from 'express';
import { mentionsController } from './mentions.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import {
  createMentionSchema,
  updateMentionSchema,
  searchMentionsSchema,
  batchActionSchema
} from './mentions.validation';

import { requireBrandOwnership, requireOwnership } from '../../shared/middleware/ownership.middleware';

const router: Router = Router();

// Routes avancées (Post car plus de paramètres/souplesse)
router.post('/search', requireAuth, validate(searchMentionsSchema), mentionsController.search.bind(mentionsController));
router.post('/batch-action', requireAuth, validate(batchActionSchema), mentionsController.batchAction.bind(mentionsController));

// Basic CRUD
router.get('/', requireAuth, mentionsController.getAllMentions.bind(mentionsController));
router.get('/:id', requireAuth, requireOwnership('mention'), mentionsController.getMentionById.bind(mentionsController));
router.post('/', requireAuth, validate(createMentionSchema), requireBrandOwnership, mentionsController.createMention.bind(mentionsController));
router.patch('/:id', requireAuth, requireOwnership('mention'), validate(updateMentionSchema), mentionsController.updateMention.bind(mentionsController));
router.delete('/:id', requireAuth, requireOwnership('mention'), mentionsController.deleteMention.bind(mentionsController));

export default router;

