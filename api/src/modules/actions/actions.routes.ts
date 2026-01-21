import { Router } from 'express';
import { actionsController } from './actions.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createActionSchema, updateActionSchema } from './actions.validation';

const router = Router();

router.get('/', actionsController.getAllActions.bind(actionsController));
router.get('/:id', actionsController.getActionById.bind(actionsController));
router.post('/', validate(createActionSchema), actionsController.createAction.bind(actionsController));
router.patch('/:id', validate(updateActionSchema), actionsController.updateAction.bind(actionsController));
router.delete('/:id', actionsController.deleteAction.bind(actionsController));

export default router;
