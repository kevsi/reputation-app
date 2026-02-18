"use strict";
// ========================================
// PLANS CONFIGURATION
// ========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = void 0;
exports.canPerformAction = canPerformAction;
exports.getLimit = getLimit;
exports.PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'EUR',
        interval: 'month',
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
        interval: 'month',
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
        interval: 'month',
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
        interval: 'month',
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
};
/**
 * Vérifie si une organisation peut effectuer une action selon son plan
 */
function canPerformAction(subscriptionTier, action, currentUsage) {
    const plan = exports.PLANS[subscriptionTier.toUpperCase()];
    if (!plan)
        return false;
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
function getLimit(subscriptionTier, action) {
    const plan = exports.PLANS[subscriptionTier.toUpperCase()];
    if (!plan)
        return 0;
    return plan.limits[action];
}
