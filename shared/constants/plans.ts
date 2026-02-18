// ========================================
// PLANS CONFIGURATION
// ========================================

export const PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'EUR',
        interval: 'month' as const,
        features: [
            'Up to 1 brand',
            'Up to 2 sources',
            'Basic sentiment analysis',
            'View mentions only',
            'No alerts',
            'No reports export',
        ],
        limits: {
            brands: 1,
            sources: 2,
            mentions: 100, // per month
            alerts: 0,
            keywords: 0,
            users: 1,
            reportsExport: false,
            apiAccess: false,
        },
    },
    STARTER: {
        id: 'plan_starter',
        name: 'Starter',
        price: 29,
        currency: 'EUR',
        interval: 'month' as const,
        features: [
            'Up to 3 brands',
            'Up to 5 sources',
            'Daily updates',
            'Basic reports',
            'Email alerts',
            'Up to 3 team members',
        ],
        limits: {
            brands: 3,
            sources: 5,
            mentions: 1000,
            alerts: 10,
            keywords: 20,
            users: 3,
            reportsExport: true,
            apiAccess: false,
        },
    },
    PRO: {
        id: 'plan_pro',
        name: 'Pro',
        price: 99,
        currency: 'EUR',
        interval: 'month' as const,
        features: [
            'Up to 10 brands',
            'Unlimited sources',
            'Real-time updates',
            'Advanced analytics',
            'Custom alerts',
            'API Access',
            'Up to 10 team members',
            'Priority support',
        ],
        limits: {
            brands: 10,
            sources: 999,
            mentions: 10000,
            alerts: 50,
            keywords: 100,
            users: 10,
            reportsExport: true,
            apiAccess: true,
        },
    },
    ENTERPRISE: {
        id: 'plan_enterprise',
        name: 'Enterprise',
        price: 499,
        currency: 'EUR',
        interval: 'month' as const,
        features: [
            'Unlimited brands',
            'Unlimited sources',
            'Real-time updates',
            'Advanced analytics',
            'Custom solutions',
            'Dedicated support',
            'SLA guarantee',
            'Unlimited team members',
            'White-label options',
        ],
        limits: {
            brands: 999999,
            sources: 999999,
            mentions: 999999,
            alerts: 999999,
            keywords: 999999,
            users: 999999,
            reportsExport: true,
            apiAccess: true,
        },
    },
} as const;

export type PlanId = keyof typeof PLANS;

export interface PlanLimits {
    brands: number;
    sources: number;
    mentions: number;
    alerts: number;
    keywords: number;
    users: number;
    reportsExport: boolean;
    apiAccess: boolean;
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    limits: PlanLimits;
}

/**
 * Vérifie si une organisation peut effectuer une action selon son plan
 */
export function canPerformAction(
    subscriptionTier: string,
    action: keyof PlanLimits,
    currentUsage: number
): boolean {
    const plan = PLANS[subscriptionTier.toUpperCase() as PlanId];
    if (!plan) return false;

    const limit = plan.limits[action];

    // Pour les booléens (reportsExport, apiAccess)
    if (typeof limit === 'boolean') {
        return limit;
    }

    // Pour les nombres (brands, sources, etc.)
    return currentUsage < limit;
}

/**
 * Récupère la limite pour une action donnée
 */
export function getLimit(
    subscriptionTier: string,
    action: keyof PlanLimits
): number | boolean {
    const plan = PLANS[subscriptionTier.toUpperCase() as PlanId];
    if (!plan) return 0;
    return plan.limits[action];
}
