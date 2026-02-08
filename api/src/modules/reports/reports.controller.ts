import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { logger } from '@/infrastructure/logger';
import { extractPaginationParams } from '@/shared/utils/pagination';

class ReportsController {
    /**
     * ✅ Récupérer tous les rapports avec pagination
     */
    async getAllReports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as any;
            if (!user || !user.organizationId) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
                return;
            }

            const pagination = extractPaginationParams(req.query);
            const result = await reportsService.getAllReports(user.organizationId, pagination);

            res.status(200).json({ success: true, ...result });
            return;
        } catch (error) {
            logger.error('Error fetching reports:', error);
            next(error);
        }
    }

    async getReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const report = await reportsService.getReportById(id);
            if (!report) {
                res.status(404).json({ success: false, message: 'Report not found' });
                return;
            }
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Génération immédiate
     */
    async generateInstant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await reportsService.generateInstant(req.body);
            res.status(201).json({ success: true, data: report });
            return;
        } catch (error) {
            logger.error('Erreur lors de la génération d\'un rapport instantané', error as Error);
            next(error);
        }
    }

    async deleteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await reportsService.deleteReport(id);
            res.status(200).json({ success: true, message: 'Report deleted' });
            return;
        } catch (error) {
            next(error);
        }
    }
    async getScheduledReports(_req: Request, res: Response, _next: NextFunction): Promise<void> {
        res.status(200).json({ success: true, data: [] });
    }
}

export const reportsController = new ReportsController();
