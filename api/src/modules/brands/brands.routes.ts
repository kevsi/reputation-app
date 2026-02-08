import { Router } from 'express';
import { brandsController } from './brands.controller';
import { sourcesController } from '../sources/sources.controller';
import { checkLimit } from '../../shared/middleware/plan.middleware';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { prisma } from '../../shared/database/prisma.client';
import { requireOwnership } from '../../shared/middleware/ownership.middleware';

import { validate } from '../../shared/middleware/validate.middleware';
import { createBrandSchema, updateBrandSchema } from './brands.validation';
import { createSourceSchema } from '../sources/sources.validation';

const router: Router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Helper pour compter les marques d'une organisation
const countBrands = async (organizationId: string) => {
    return await prisma.brand.count({ where: { organizationId } });
};

/**
 * @route   GET /api/brands
 */
router.get('/', brandsController.getAllBrands.bind(brandsController));

/**
 * GET /api/v1/brands/:brandId/sources
 * Récupérer toutes les sources d'une brand (PROMPT)
 */
router.get('/:brandId/sources', requireOwnership('brand', 'brandId'), sourcesController.getByBrandId.bind(sourcesController));

/**
 * POST /api/v1/brands/:brandId/sources
 * Créer une nouvelle source (PROMPT)
 */
router.post('/:brandId/sources', requireOwnership('brand', 'brandId'), validate(createSourceSchema), sourcesController.create.bind(sourcesController));

/**
 * @route   GET /api/brands/:id
 */
router.get('/:id', requireOwnership('brand'), brandsController.getBrandById.bind(brandsController));

/**
 * @route   POST /api/brands
 * @desc    Crée une nouvelle brand (Vérifie le quota du plan)
 */
router.post('/',
    validate(createBrandSchema),
    checkLimit('maxBrands', countBrands),
    brandsController.createBrand.bind(brandsController)
);

/**
 * @route   PATCH /api/brands/:id
 */
router.patch('/:id', requireOwnership('brand'), validate(updateBrandSchema), brandsController.updateBrand.bind(brandsController));

/**
 * @route   DELETE /api/brands/:id
 */
router.delete('/:id', requireOwnership('brand'), brandsController.deleteBrand.bind(brandsController));

export default router;
