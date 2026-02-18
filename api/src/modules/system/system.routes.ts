
import { Router } from 'express';
import { systemController } from './system.controller';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware';

const router: Router = Router();

// Public health check is already in app.ts (/health)
// Validated system detailed status for Admin Dashboard
router.get('/status', requireAuth, requireRole('ADMIN'), systemController.getStatus.bind(systemController));

export default router;

