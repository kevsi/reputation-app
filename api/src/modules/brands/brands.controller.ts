import { Request, Response, NextFunction } from 'express';
import { brandsService } from './brands.service';
import { logger } from '@/infrastructure/logger';

class BrandsController {
    async getAllBrands(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const brands = await brandsService.getAllBrands();
            res.status(200).json({
                success: true,
                data: brands,
                count: brands.length,
            });
            return;
        } catch (error) {
            logger.error('Error fetching brands:', error);
            next(error);
        }
    }

    async getBrandById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const brand = await brandsService.getBrandById(id);
            if (!brand) {
                res.status(404).json({ success: false, message: 'Brand not found' });
                return;
            }
            res.status(200).json({ success: true, data: brand });
            return;
        } catch (error) {
            next(error);
        }
    }

    async createBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newBrand = await brandsService.createBrand(req.body);
            res.status(201).json({ success: true, data: newBrand });
            return;
        } catch (error) {
            next(error);
        }
    }

    async updateBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updatedBrand = await brandsService.updateBrand(id, req.body);
            if (!updatedBrand) {
                res.status(404).json({ success: false, message: 'Brand not found' });
                return;
            }
            res.status(200).json({ success: true, data: updatedBrand });
            return;
        } catch (error) {
            next(error);
        }
    }

    async deleteBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await brandsService.deleteBrand(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Brand not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Brand deleted successfully' });
            return;
        } catch (error) {
            next(error);
        }
    }
}

export const brandsController = new BrandsController();
