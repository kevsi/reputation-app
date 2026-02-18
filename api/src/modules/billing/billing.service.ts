import { prisma } from '../../shared/database/prisma.client';
import { SubscriptionTier } from '@sentinelle/database';
import { PLAN_CONFIG } from '../../config/plans';
import { NotFoundError } from '../../shared/utils/errors';
import { logger } from '../../infrastructure/logger';

class BillingService {
    /**
     * Récupère les plans disponibles (Config)
     */
    async getPlans() {
        return Object.entries(PLAN_CONFIG).map(([key, config]) => ({
            tier: key as SubscriptionTier,
            ...config
        }));
    }

    /**
     * Récupère l'abonnement actuel d'une organisation
     */
    async getSubscription(organizationId: string) {
        return await prisma.subscription.findUnique({
            where: { organizationId },
            include: { organization: true }
        });
    }

    /**
     * Crée une session de checkout Stripe (Mock)
     */
    async createCheckoutSession(organizationId: string, tier: SubscriptionTier) {
        // Dans une vraie app, on appellerait :
        // const session = await stripe.checkout.sessions.create({...})

        // Simulation d'une URL Stripe
        return {
            url: `https://checkout.stripe.com/pay/mock_session_${organizationId}_${tier}`,
            sessionId: `sess_${Math.random().toString(36).substring(7)}`
        };
    }

    /**
     * Met à jour l'abonnement après un succès de paiement (Webhook simulation)
     */
    async handleSubscriptionUpdate(organizationId: string, tier: SubscriptionTier, stripeSubId?: string) {
        // Vérifier d'abord si l'organisation existe
        const org = await prisma.organization.findUnique({
            where: { id: organizationId }
        });

        if (!org) {
            logger.error(`Tentative de mise à jour d'abonnement pour une organisation inexistante: ${organizationId}`);
            throw new NotFoundError('Organization');
        }

        try {
            return await prisma.subscription.upsert({
                where: { organizationId },
                update: {
                    plan: tier,
                    status: 'ACTIVE',
                    stripeSubscriptionId: stripeSubId,
                    currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
                },
                create: {
                    organizationId,
                    plan: tier,
                    status: 'ACTIVE',
                    stripeSubscriptionId: stripeSubId,
                    currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
            });
        } catch (error) {
            logger.error('Erreur lors de l\'upsert de l\'abonnement', {
                organizationId,
                tier,
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }

    /**
     * Récupère les factures
     */
    async getInvoices(subscriptionId: string) {
        return await prisma.invoice.findMany({
            where: { subscriptionId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Vérifie si une organisation a accès à une fonctionnalité spécifique
     */
    async checkFeatureAccess(organizationId: string, feature: keyof import('../../config/plans').PlanFeatureConfig) {
        const sub = await this.getSubscription(organizationId);
        const tier = sub?.plan || 'FREE';
        return PLAN_CONFIG[tier][feature];
    }
}

export const billingService = new BillingService();
