import { Router } from 'express';
import { reportsController } from './reports.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createReportSchema } from './reports.validation';
import { requireFeature } from '../../shared/middleware/plan.middleware';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { requireOwnership, requireBrandOwnership } from '../../shared/middleware/ownership.middleware';

const router: Router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes avancées - Restreint par le plan (Premium/Team)
router.post('/generate',
    requireFeature('exportReports'),
    validate(createReportSchema),
    requireBrandOwnership,
    reportsController.generateInstant.bind(reportsController)
);

// Scheduled Reports (Mock)
router.get('/scheduled', reportsController.getScheduledReports.bind(reportsController));

// CRUD
router.get('/', reportsController.getAllReports.bind(reportsController));
router.get('/:id', requireOwnership('report'), reportsController.getReportById.bind(reportsController));
router.delete('/:id', requireOwnership('report'), reportsController.deleteReport.bind(reportsController));

export default router;

