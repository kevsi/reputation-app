import { Router } from 'express';
import { actionsController } from './actions.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createActionSchema, updateActionSchema } from './actions.validation';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { requireOwnership } from '../../shared/middleware/ownership.middleware';

const router: Router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

router.get('/', actionsController.getAllActions.bind(actionsController));
router.get('/:id', requireOwnership('action'), actionsController.getActionById.bind(actionsController));
router.post('/', validate(createActionSchema), actionsController.createAction.bind(actionsController));
router.patch('/:id', requireOwnership('action'), validate(updateActionSchema), actionsController.updateAction.bind(actionsController));
router.delete('/:id', requireOwnership('action'), actionsController.deleteAction.bind(actionsController));

export default router;

