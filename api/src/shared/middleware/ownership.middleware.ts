import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/shared/database/prisma.client';
import { AppError } from '@/shared/utils/errors';

/**
 * 🔒 Middleware de Vérification d'Ownership
 * 
 * Vérifie que la ressource demandée appartient bien à l'organisation
 * de l'utilisateur connecté. Empêche l'accès aux données d'autres organisations.
 * 
 * Utilisation:
 * ```typescript
 * router.get('/:id', 
 *   requireAuth,
 *   requireOwnership('brand'),
 *   controller.getById
 * );
 * ```
 */
export function requireOwnership(resourceType: string, idParam = 'id') {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const resourceId = req.params[idParam];
            const user = req.user;

            if (!user) {
                throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
            }

            if (!resourceId) {
                // Pas d'ID dans les params, on laisse passer (ex: GET /brands)
                return next();
            }

            // Mapper le type de ressource au modèle Prisma
            const modelMap: Record<string, any> = {
                'brand': prisma.brand,
                'source': prisma.source,
                'mention': prisma.mention,
                'alert': prisma.alert,
                'action': prisma.action,
                'report': prisma.report
            };

            const model = modelMap[resourceType];
            if (!model) {
                throw new AppError(`Unknown resource type: ${resourceType}`, 500, 'INTERNAL_ERROR');
            }

            // Construire la requête selon le type de ressource
            let resource;

            if (resourceType === 'brand') {
                // Les brands ont directement organizationId
                resource = await model.findFirst({
                    where: {
                        id: resourceId,
                        organizationId: user.organizationId
                    }
                });
            } else if (['source', 'mention', 'alert', 'report'].includes(resourceType)) {
                // Ces ressources sont liées via brand
                resource = await model.findFirst({
                    where: {
                        id: resourceId,
                        brand: { organizationId: user.organizationId }
                    }
                });
            } else if (resourceType === 'action') {
                // Actions peuvent être assignées à un user ou une org
                resource = await model.findFirst({
                    where: {
                        id: resourceId,
                        OR: [
                            { assignedTo: { organizationId: user.organizationId } },
                            { assignedToId: user.userId }
                        ]
                    }
                });
            }

            if (!resource) {
                throw new AppError(
                    `${resourceType} not found or access denied`,
                    404,
                    'RESOURCE_NOT_FOUND'
                );
            }

            // Attacher la ressource à req pour éviter de la recharger dans le controller
            (req as any).resource = resource;

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * 🔍 Middleware de Filtrage par Organisation
 * 
 * Ajoute automatiquement le filtre organizationId aux requêtes de liste
 * pour s'assurer qu'on ne retourne que les données de l'org de l'utilisateur.
 * 
 * Utilisation:
 * ```typescript
 * router.get('/', 
 *   requireAuth,
 *   filterByOrganization,
 *   controller.getAll
 * );
 * ```
 */
export function filterByOrganization(req: Request, _res: Response, next: NextFunction) {
    try {
        const user = req.user;

        if (!user) {
            throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
        }

        // Ajouter organizationId aux query params
        (req as any).organizationId = user.organizationId;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * 🛡️ Middleware de Vérification de Propriété de Brand
 * 
 * Vérifie que le brandId fourni dans le body/query appartient à l'organisation
 * 
 * Utilisation:
 * ```typescript
 * router.post('/', 
 *   requireAuth,
 *   requireBrandOwnership,
 *   controller.create
 * );
 * ```
 */
export function requireBrandOwnership(req: Request, _res: Response, next: NextFunction) {
    (async () => {
        try {
            const user = req.user;
            const brandId = req.body.brandId || req.query.brandId;

            if (!user) {
                throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
            }

            if (!brandId || typeof brandId !== 'string') {
                throw new AppError('brandId is required', 400, 'MISSING_BRAND_ID');
            }

            // Vérifier que le brand appartient à l'organisation
            const brand = await prisma.brand.findFirst({
                where: {
                    id: brandId,
                    organizationId: user.organizationId || undefined
                }
            });

            if (!brand) {
                throw new AppError(
                    'Brand not found or access denied',
                    404,
                    'BRAND_NOT_FOUND'
                );
            }

            // Attacher le brand à req
            (req as any).brand = brand;

            next();
        } catch (error) {
            next(error);
        }
    })();
}
