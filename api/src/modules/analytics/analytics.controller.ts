import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { logger } from '@/infrastructure/logger';

class AnalyticsController {
    /**
     * Résumé global des métriques
     */
    async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.user?.organizationId as string;
            const brandId = req.query.brandId as string;
            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

            if (!organizationId) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }

            const summary = await analyticsService.getSummary({ organizationId, brandId, startDate, endDate });
            res.status(200).json({ success: true, data: summary });
            return;
        } catch (error) {
            logger.error('Error fetching analytics summary:', error);
            next(error);
            return;
        }
    }

    /**
     * Répartition des sentiments
     */
    async getSentimentBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.user?.organizationId as string;
            const brandId = req.query.brandId as string;

            if (!organizationId) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }

            const breakdown = await analyticsService.getSentimentBreakdown({ organizationId, brandId });
            res.status(200).json({ success: true, data: breakdown });
            return;
        } catch (error) {
            logger.error('Error fetching sentiment breakdown:', error);
            next(error);
            return;
        }
    }

    /**
     * Données pour graphiques (Time Series)
     */
    async getTimeSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.user?.organizationId as string;
            const brandId = req.query.brandId as string;
            const period = req.query.period as any;

            if (!organizationId) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }

            const timeSeries = await analyticsService.getTimeSeries({ organizationId, brandId, period });
            res.status(200).json({ success: true, data: timeSeries });
            return;
        } catch (error) {
            logger.error('Error fetching time series data:', error);
            next(error);
            return;
        }
    }

    /**
     * Nuage de mots
     */
    async getWordCloud(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.user?.organizationId as string;
            const brandId = req.query.brandId as string;

            if (!organizationId) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }

            const wordCloud = await analyticsService.getWordCloud({ organizationId, brandId });
            res.status(200).json({ success: true, data: wordCloud });
            return;
        } catch (error) {
            logger.error('Error fetching word cloud:', error);
            next(error);
            return;
        }
    }
}

export const analyticsController = new AnalyticsController();
