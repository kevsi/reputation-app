import { Router } from 'express';
import { alertsController } from './alerts.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createAlertSchema, updateAlertSchema } from './alerts.validation';

const router = Router();

// Routes avancées
router.get('/:id/history', alertsController.getHistory.bind(alertsController));
router.post('/:id/test', alertsController.testAlert.bind(alertsController));

// CRUD
router.get('/', alertsController.getAllAlerts.bind(alertsController));
router.get('/:id', alertsController.getAlertById.bind(alertsController));
router.post('/', validate(createAlertSchema), alertsController.createAlert.bind(alertsController));
router.patch('/:id', validate(updateAlertSchema), alertsController.updateAlert.bind(alertsController));
router.delete('/:id', alertsController.deleteAlert.bind(alertsController));

export default router;
