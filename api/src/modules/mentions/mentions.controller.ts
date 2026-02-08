import { Request, Response, NextFunction } from 'express';
import { mentionsService } from './mentions.service';
import { AppError } from '@/shared/utils/errors';
import { extractPaginationParams } from '@/shared/utils/pagination';

class MentionsController {
    async getMentionById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const mention = await mentionsService.getMentionById(id);

            if (!mention) {
                res.status(404).json({ success: false, message: 'Mention not found' });
                return;
            }
            res.status(200).json({ success: true, data: mention });
        } catch (error) {
            next(error);
        }
    }

    async createMention(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body;
            const mention = await mentionsService.createMention(data);
            res.status(201).json({ success: true, data: mention });
        } catch (error) {
            next(error);
        }
    }

    async updateMention(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = req.body;

            const updated = await mentionsService.updateMention(id, data);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Recherche avancée
     */
    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as any;
            if (!user?.organizationId) {
                throw new AppError('User not associated with an organization', 403, 'NO_ORGANIZATION');
            }

            const filters = {
                ...req.body,
                organizationId: user.organizationId
            };
            const results = await mentionsService.search(filters);
            res.status(200).json({ success: true, data: results });
            return;
        } catch (error) {
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

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({ success: false, message: 'Invalid or empty IDs' });
                return;
            }

            const result = await mentionsService.batchAction(ids, action, sentiment);
            res.status(200).json({ success: true, data: result });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    /**
     * ✅ Récupérer toutes les mentions avec pagination
     */
    async getAllMentions(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!_req.user?.organizationId) {
                throw new AppError('User not associated with an organization', 403, 'NO_ORGANIZATION');
            }

            const { brandId } = _req.query;
            const pagination = extractPaginationParams(_req.query);
            const result = await mentionsService.getAllMentions(
                _req.user.organizationId,
                pagination,
                brandId as string
            );

            res.status(200).json({
                success: true,
                ...result
            });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    async deleteMention(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await mentionsService.deleteMention(id);
            res.status(200).json({ success: true, message: 'Mention deleted successfully' });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }
}

export const mentionsController = new MentionsController();

