import { Router } from 'express';
import { reportsController } from './reports.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createReportSchema } from './reports.validation';
import { requireFeature } from '../../shared/middleware/plan.middleware';

const router = Router();

// Routes avancées - Restreint par le plan (Premium/Team)
router.post('/generate',
    requireFeature('exportReports'),
    validate(createReportSchema),
    reportsController.generateInstant.bind(reportsController)
);

// CRUD
router.get('/', reportsController.getAllReports.bind(reportsController));
router.get('/:id', reportsController.getReportById.bind(reportsController));
router.delete('/:id', reportsController.deleteReport.bind(reportsController));

export default router;
