import { Request, Response, NextFunction } from 'express';
import { mentionsService } from './mentions.service';
import { logger } from '@/infrastructure/logger';

class MentionsController {
    /**
     * Recherche avancée
     */
    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const results = await mentionsService.search(req.body);
            res.status(200).json({ success: true, data: results });
            return;
        } catch (error) {
            logger.error('Error searching mentions:', error);
            next(error);
            return;
        }
    }

    /**
     * Actions groupées
     */
    async batchAction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { ids, action, sentiment } = req.body;
            const result = await mentionsService.batchAction(ids, action, sentiment);
            res.status(200).json({ success: true, data: result });
            return;
        } catch (error) {
            logger.error('Error during batch action:', error);
            next(error);
            return;
        }
    }

    async getAllMentions(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const mentions = await mentionsService.getAllMentions();
            res.status(200).json({
                success: true,
                data: mentions,
                count: mentions.length,
            });
            return;
        } catch (error) {
            logger.error('Error fetching mentions:', error);
            next(error);
            return;
        }
    }

    async getMentionById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const mention = await mentionsService.getMentionById(id);
            if (!mention) {
                res.status(404).json({ success: false, message: 'Mention not found' });
                return;
            }
            res.status(200).json({ success: true, data: mention });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    async createMention(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newMention = await mentionsService.createMention(req.body);
            res.status(201).json({ success: true, data: newMention });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    async updateMention(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updatedMention = await mentionsService.updateMention(id, req.body);
            if (!updatedMention) {
                res.status(404).json({ success: false, message: 'Mention not found' });
                return;
            }
            res.status(200).json({ success: true, data: updatedMention });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    async deleteMention(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await mentionsService.deleteMention(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Mention not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Mention deleted successfully' });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }
}

export const mentionsController = new MentionsController();
