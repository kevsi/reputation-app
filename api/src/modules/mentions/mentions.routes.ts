import { Router } from 'express';
import { mentionsController } from './mentions.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import {
    createMentionSchema,
    updateMentionSchema,
    searchMentionsSchema,
    batchActionSchema
} from './mentions.validation';

const router = Router();

// Routes avancées (Post car plus de paramètres/souplesse)
router.post('/search', validate(searchMentionsSchema), mentionsController.search.bind(mentionsController));
router.post('/batch-action', validate(batchActionSchema), mentionsController.batchAction.bind(mentionsController));

// CRUD de base
router.get('/', mentionsController.getAllMentions.bind(mentionsController));
router.get('/:id', mentionsController.getMentionById.bind(mentionsController));
router.post('/', validate(createMentionSchema), mentionsController.createMention.bind(mentionsController));
router.patch('/:id', validate(updateMentionSchema), mentionsController.updateMention.bind(mentionsController));
router.delete('/:id', mentionsController.deleteMention.bind(mentionsController));

export default router;
