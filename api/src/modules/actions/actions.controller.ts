import { Request, Response, NextFunction } from 'express';
import { actionsService } from './actions.service';
import { logger } from '@/infrastructure/logger';
import { extractPaginationParams } from '@/shared/utils/pagination';

class ActionsController {
    async getAllActions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as any;
            if (!user || !user.organizationId) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
                return;
            }

            const pagination = extractPaginationParams(req.query);
            const result = await actionsService.getAllActions(user.organizationId, pagination);

            res.status(200).json({ success: true, ...result });
            return;
        } catch (error) {
            logger.error('Error fetching actions:', error);
            next(error);
        }
    }

    async getActionById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const action = await actionsService.getActionById(id);
            if (!action) {
                res.status(404).json({ success: false, message: 'Action not found' });
                return; // <- stoppe la fonction ici
            }
            res.status(200).json({ success: true, data: action });
            return; // <- stoppe la fonction après la réponse
        } catch (error) {
            next(error); // pas besoin de return
        }
    }


    async createAction(req: Request, res: Response, next: NextFunction) {
        try {
            const action = await actionsService.createAction(req.body);
            res.status(201).json({ success: true, data: action });
        } catch (error) {
            next(error);
        }
    }

    async updateAction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const action = await actionsService.updateAction(id, req.body);
            if (!action) {
                res.status(404).json({ success: false, message: 'Action not found' });
                return; // <- stoppe la fonction
            }
            res.status(200).json({ success: true, data: action });
            return; // <- stoppe la fonction après réponse
        } catch (error) {
            next(error);
        }
    }


    async deleteAction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const success = await actionsService.deleteAction(id);
            if (!success) {
                res.status(404).json({ success: false, message: 'Action not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Action deleted successfully' });
            return;
        } catch (error) {
            next(error);
        }
    }

}

export const actionsController = new ActionsController();
