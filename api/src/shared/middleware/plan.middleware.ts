import { Request, Response, NextFunction } from 'express';
import { billingService } from '../../modules/billing/billing.service';
import { PLAN_CONFIG, PlanFeatureConfig } from '../../config/plans';
import { Logger } from '../../shared/logger';

/**
 * Middleware pour vérifier si le plan actuel permet d'accéder à une fonctionnalité
 */
export const requireFeature = (feature: keyof PlanFeatureConfig) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // First try to get organizationId from authenticated user, then fallback to query/body
            const organizationId = (req.user as any)?.organizationId || (req.query as any).organizationId || req.body.organizationId;

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
            Logger.error('Erreur dans le middleware requireFeature', error as Error, { composant: 'PlanMiddleware', operation: 'requireFeature', feature });
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
            // First try to get organizationId from authenticated user, then fallback to query/body
            const organizationId = (req.user as any)?.organizationId || (req.query as any).organizationId || req.body.organizationId;

            if (!organizationId) {
                Logger.error('organizationId manquant dans le middleware Plan', new Error('organizationId missing'), {
                    composant: 'PlanMiddleware',
                    operation: 'checkLimit',
                    user: req.user,
                    body: req.body,
                    query: req.query
                });
                res.status(400).json({ success: false, message: 'Organization ID is required for plan limit check. Please log out and log back in.' });
                return;
            }

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
