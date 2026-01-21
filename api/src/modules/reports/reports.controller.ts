import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { logger } from '@/infrastructure/logger';

class ReportsController {
    async getAllReports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.query.organizationId as string;
            if (!organizationId) {
                res.status(400).json({ success: false, message: 'organizationId is required' });
                return;
            }
            const reports = await reportsService.getAllReports(organizationId);
            res.status(200).json({ success: true, data: reports });
        } catch (error) {
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
        } catch (error) {
            logger.error('Error generating instant report:', error);
            next(error);
        }
    }

    async deleteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await reportsService.deleteReport(id);
            res.status(200).json({ success: true, message: 'Report deleted' });
        } catch (error) {
            next(error);
        }
    }
}

export const reportsController = new ReportsController();
