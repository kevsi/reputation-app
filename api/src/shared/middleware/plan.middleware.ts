import { Request, Response, NextFunction } from 'express';
import { billingService } from '../../modules/billing/billing.service';
import { PLAN_CONFIG, PlanFeatureConfig } from '../../config/plans';
import { logger } from '../../infrastructure/logger';

/**
 * Middleware pour vérifier si le plan actuel permet d'accéder à une fonctionnalité
 */
export const requireFeature = (feature: keyof PlanFeatureConfig) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Dans une vraie app, on récupère l'ID depuis req.user.organizationId
            const organizationId = req.query.organizationId as string || req.body.organizationId;

            if (!organizationId) {
                res.status(400).json({ success: false, message: 'Organization ID is required to check plan' });
                return;
            }

            const sub = await billingService.getSubscription(organizationId);
            const tier = sub?.plan || 'FREE';
            const config = PLAN_CONFIG[tier];

            const featureValue = config[feature];

            if (typeof featureValue === 'boolean' && !featureValue) {
                res.status(403).json({
                    success: false,
                    code: 'PLAN_RESTRICTION',
                    message: `Your current plan (${tier}) does not include this feature: ${feature}`
                });
                return;
            }

            next();
            return;
        } catch (error) {
            logger.error('Error in requireFeature middleware:', error);
            res.status(500).json({ success: false, message: 'Internal server error during plan check' });
            return;
        }
    };
};

/**
 * Middleware pour vérifier les limites de ressources (ex: max brands)
 */
export const checkLimit = (feature: keyof PlanFeatureConfig, currentCountFetcher: (id: string) => Promise<number>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = req.body.organizationId || req.query.organizationId;

            const sub = await billingService.getSubscription(organizationId);
            const tier = sub?.plan || 'FREE';
            const maxAllowed = PLAN_CONFIG[tier][feature] as number;

            const currentCount = await currentCountFetcher(organizationId);

            if (currentCount >= maxAllowed) {
                res.status(403).json({
                    success: false,
                    code: 'LIMIT_REACHED',
                    message: `You have reached the maximum limit of ${maxAllowed} for ${feature} on the ${tier} plan.`
                });
                return;
            }

            next();
            return;
        } catch (error) {
            next(error);
            return;
        }
    };
};
