import { Request, Response, NextFunction } from 'express';
import { brandsService } from './brands.service';
import { logger } from '@/infrastructure/logger';
import { extractPaginationParams } from '@/shared/utils/pagination';

class BrandsController {
    async getAllBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as any;
            if (!user || !user.organizationId) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
                return;
            }

            const pagination = extractPaginationParams(req.query);
            const result = await brandsService.getBrandsByOrganization(user.organizationId, pagination);

            res.status(200).json({
                success: true,
                ...result
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
            const user = req.user;
            if (!user || !user.organizationId) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
                return;
            }
            const brand = await brandsService.getBrandById(id);
            if (!brand) {
                res.status(404).json({ success: false, message: 'Brand not found' });
                return;
            }
            // Vérifier que la marque appartient à l'organisation de l'utilisateur
            if (brand.organizationId !== user.organizationId) {
                res.status(403).json({ success: false, message: 'Access denied' });
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
            const user = req.user;
            if (!user || !user.organizationId) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
                return;
            }

            const brandData = {
                ...req.body,
                organizationId: user.organizationId
            };
            const newBrand = await brandsService.createBrand(brandData);
            res.status(201).json({ success: true, data: newBrand });
            return;
        } catch (error) {
            next(error);
        }
    }

    async updateBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const user = req.user;
            if (!user || !user.organizationId) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
                return;
            }

            // Vérifier que la marque existe et appartient à l'organisation
            const existingBrand = await brandsService.getBrandById(id);
            if (!existingBrand) {
                res.status(404).json({ success: false, message: 'Brand not found' });
                return;
            }
            if (existingBrand.organizationId !== user.organizationId) {
                res.status(403).json({ success: false, message: 'Access denied' });
                return;
            }

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
            const user = req.user;
            if (!user || !user.organizationId) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
                return;
            }

            // Vérifier que la marque existe et appartient à l'organisation
            const existingBrand = await brandsService.getBrandById(id);
            if (!existingBrand) {
                res.status(404).json({ success: false, message: 'Brand not found' });
                return;
            }
            if (existingBrand.organizationId !== user.organizationId) {
                res.status(403).json({ success: false, message: 'Access denied' });
                return;
            }

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
