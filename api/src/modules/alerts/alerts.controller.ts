import { Request, Response, NextFunction } from 'express';
import { alertsService } from './alerts.service';
import { extractPaginationParams } from '@/shared/utils/pagination';

class AlertsController {
    /**
     * Liste toutes les alertes (nécessite organizationId)
     */
    async getAllAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.query.organizationId as string;
            if (!organizationId) {
                res.status(400).json({ success: false, message: 'organizationId is required' });
                return;
            }

            const pagination = extractPaginationParams(req.query);
            const result = await alertsService.getAllAlerts(organizationId, pagination);

            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async getAlertById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const alert = await alertsService.getAlertById(id);
            if (!alert) {
                res.status(404).json({ success: false, message: 'Alert not found' });
                return;
            }
            res.status(200).json({ success: true, data: alert });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Historique des déclenchements
     */
    async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const history = await alertsService.getHistory(id);
            res.status(200).json({ success: true, data: history });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Test d'alerte
     */
    async testAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const result = await alertsService.testAlert(id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async createAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newAlert = await alertsService.createAlert(req.body);
            res.status(201).json({ success: true, data: newAlert });
        } catch (error) {
            next(error);
        }
    }

    async updateAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updatedAlert = await alertsService.updateAlert(id, req.body);
            res.status(200).json({ success: true, data: updatedAlert });
        } catch (error) {
            next(error);
        }
    }

    async deleteAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await alertsService.deleteAlert(id);
            res.status(200).json({ success: true, message: 'Alert deleted' });
        } catch (error) {
            next(error);
        }
    }
}

export const alertsController = new AlertsController();
