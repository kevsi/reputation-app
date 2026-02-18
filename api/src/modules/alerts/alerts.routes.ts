import { Router } from 'express';
import { alertsController } from './alerts.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createAlertSchema, updateAlertSchema } from './alerts.validation';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { requireOwnership, requireBrandOwnership } from '../../shared/middleware/ownership.middleware';

const router: Router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes avancées
router.get('/:id/history', requireOwnership('alert'), alertsController.getHistory.bind(alertsController));
router.post('/:id/test', requireOwnership('alert'), alertsController.testAlert.bind(alertsController));

// CRUD
router.get('/', alertsController.getAllAlerts.bind(alertsController));
router.get('/:id', requireOwnership('alert'), alertsController.getAlertById.bind(alertsController));
router.post('/', validate(createAlertSchema), requireBrandOwnership, alertsController.createAlert.bind(alertsController));
router.patch('/:id', requireOwnership('alert'), validate(updateAlertSchema), alertsController.updateAlert.bind(alertsController));
router.delete('/:id', requireOwnership('alert'), alertsController.deleteAlert.bind(alertsController));

export default router;

