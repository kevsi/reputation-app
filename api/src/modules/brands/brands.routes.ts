import { Router } from 'express';
import { brandsController } from './brands.controller';
import { checkLimit } from '../../shared/middleware/plan.middleware';
import { prisma } from '../../shared/database/prisma.client';

const router = Router();

// Helper pour compter les marques d'une organisation
const countBrands = async (organizationId: string) => {
    return await prisma.brand.count({ where: { organizationId } });
};

/**
 * @route   GET /api/brands
 */
router.get('/', brandsController.getAllBrands.bind(brandsController));

/**
 * @route   GET /api/brands/:id
 */
router.get('/:id', brandsController.getBrandById.bind(brandsController));

/**
 * @route   POST /api/brands
 * @desc    Crée une nouvelle brand (Vérifie le quota du plan)
 */
router.post('/',
    checkLimit('maxBrands', countBrands),
    brandsController.createBrand.bind(brandsController)
);

/**
 * @route   PATCH /api/brands/:id
 */
router.patch('/:id', brandsController.updateBrand.bind(brandsController));

/**
 * @route   DELETE /api/brands/:id
 */
router.delete('/:id', brandsController.deleteBrand.bind(brandsController));

export default router;