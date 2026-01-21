import { Request, Response, NextFunction } from 'express';
import { keywordsService } from './keywords.service';
import { logger } from '@/infrastructure/logger';

class KeywordsController {
    async getAllKeywords(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const keywords = await keywordsService.getAllKeywords();
            res.status(200).json({
                success: true,
                data: keywords,
                count: keywords.length,
            });
            return;
        } catch (error) {
            logger.error('Error fetching keywords:', error);
            next(error);
        }
    }

    async getKeywordById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const keyword = await keywordsService.getKeywordById(id);
            if (!keyword) {
                res.status(404).json({ success: false, message: 'Keyword not found' });
                return;
            }
            res.status(200).json({ success: true, data: keyword });
            return;
        } catch (error) {
            next(error);
        }
    }

    async createKeyword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newKeyword = await keywordsService.createKeyword(req.body);
            res.status(201).json({ success: true, data: newKeyword });
            return;
        } catch (error) {
            next(error);
        }
    }

    async updateKeyword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updatedKeyword = await keywordsService.updateKeyword(id, req.body);
            if (!updatedKeyword) {
                res.status(404).json({ success: false, message: 'Keyword not found' });
                return;
            }
            res.status(200).json({ success: true, data: updatedKeyword });
            return;
        } catch (error) {
            next(error);
        }
    }

    async deleteKeyword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await keywordsService.deleteKeyword(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Keyword not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Keyword deleted successfully' });
            return;
        } catch (error) {
            next(error);
        }
    }
}

export const keywordsController = new KeywordsController();
