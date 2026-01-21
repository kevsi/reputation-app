import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { requireAuth } from '@/shared/middleware/auth.middleware';

const router = Router();

// Routes Analytics avancées
router.get('/summary', requireAuth, analyticsController.getSummary.bind(analyticsController));
router.get('/sentiment-breakdown', requireAuth, analyticsController.getSentimentBreakdown.bind(analyticsController));
router.get('/time-series', requireAuth, analyticsController.getTimeSeries.bind(analyticsController));
router.get('/word-cloud', requireAuth, analyticsController.getWordCloud.bind(analyticsController));

export default router;
