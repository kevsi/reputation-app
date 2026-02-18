import { Request, Response, NextFunction } from 'express';
import { keywordsService } from './keywords.service';
import { logger } from '@/infrastructure/logger';

class KeywordsController {
    async getKeywordsByBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { brandId } = req.params;
            const keywords = await keywordsService.getKeywordsByBrand(brandId);
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

    async getKeywords(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { brandId } = req.query;
            if (brandId && typeof brandId === 'string') {
                const keywords = await keywordsService.getKeywordsByBrand(brandId);
                res.status(200).json({
                    success: true,
                    data: keywords,
                    count: keywords.length,
                });
                return;
            }
            res.status(400).json({ success: false, message: 'brandId query param is required' });
        } catch (error) {
            next(error);
        }
    }

    async addKeywordToBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { brandId } = req.params;
            const { word } = req.body;

            if (!word || typeof word !== 'string') {
                res.status(400).json({ success: false, message: 'Keyword is required and must be a string' });
                return;
            }

            const updatedBrand = await keywordsService.addKeywordToBrand(brandId, word);
            res.status(201).json({ success: true, data: updatedBrand });
            return;
        } catch (error) {
            next(error);
        }
    }

    async removeKeywordFromBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { brandId } = req.params;
            const { word } = req.body;

            if (!word || typeof word !== 'string') {
                res.status(400).json({ success: false, message: 'Keyword is required and must be a string' });
                return;
            }

            const updatedBrand = await keywordsService.removeKeywordFromBrand(brandId, word);
            res.status(200).json({ success: true, data: updatedBrand });
            return;
        } catch (error) {
            next(error);
        }
    }

    async updateBrandKeywords(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { brandId } = req.params;
            const { keywords } = req.body;

            if (!Array.isArray(keywords)) {
                res.status(400).json({ success: false, message: 'Keywords must be an array of strings' });
                return;
            }

            const updatedBrand = await keywordsService.updateBrandKeywords(brandId, keywords);
            res.status(200).json({ success: true, data: updatedBrand });
            return;
        } catch (error) {
            next(error);
        }
    }

    async createKeyword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { brandId, word } = req.body;

            if (!brandId || !word || typeof word !== 'string') {
                res.status(400).json({ success: false, message: 'brandId and word are required, word must be a string' });
                return;
            }

            const updatedBrand = await keywordsService.addKeywordToBrand(brandId, word);
            res.status(201).json({ success: true, data: updatedBrand });
            return;
        } catch (error) {
            next(error);
        }
    }
}

export const keywordsController = new KeywordsController();
