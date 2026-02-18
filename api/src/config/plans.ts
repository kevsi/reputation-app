import { SubscriptionTier } from '@sentinelle/database';

export interface PlanFeatureConfig {
    maxBrands: number;
    maxKeywordsPerBrand: number;
    analyticsLevel: 'simple' | 'advanced' | 'detailed';
    historyDays: number;
    realTimeAlerts: boolean;
    exportReports: boolean;
    multiUser: number | boolean;
    integrations: string[];
    supportPriority: 'standard' | 'priority' | 'dedicated';
    // Notifications
    emailNotifications: boolean;
    webhookNotifications: boolean;
    customWebhooks: boolean;
    notificationHistoryDays: number;
}

export const PLAN_CONFIG: Record<SubscriptionTier, PlanFeatureConfig> = {
    FREE: {
        maxBrands: 5, // Increased for dev
        maxKeywordsPerBrand: 3,
        analyticsLevel: 'simple',
        historyDays: 7,
        realTimeAlerts: false,
        exportReports: false,
        multiUser: false,
        integrations: [],
        supportPriority: 'standard',
        emailNotifications: false,
        webhookNotifications: false,
        customWebhooks: false,
        notificationHistoryDays: 7,
    },
    STARTER: {
        maxBrands: 3,
        maxKeywordsPerBrand: 10,
        analyticsLevel: 'simple',
        historyDays: 30,
        realTimeAlerts: false,
        exportReports: false,
        multiUser: false,
        integrations: [],
        supportPriority: 'standard',
        emailNotifications: false,
        webhookNotifications: false,
        customWebhooks: false,
        notificationHistoryDays: 30,
    },
    PRO: { // Optionnel, je le mets comme étape intermédiaire si besoin
        maxBrands: 10,
        maxKeywordsPerBrand: 50,
        analyticsLevel: 'advanced',
        historyDays: 90,
        realTimeAlerts: true,
        exportReports: true,
        multiUser: false,
        integrations: [],
        supportPriority: 'standard',
        emailNotifications: false,
        webhookNotifications: false,
        customWebhooks: false,
        notificationHistoryDays: 90,
    },
    PREMIUM: {
        maxBrands: 20,
        maxKeywordsPerBrand: 999, // Illimité
        analyticsLevel: 'advanced',
        historyDays: 365,
        realTimeAlerts: true,
        exportReports: true,
        multiUser: 5,
        integrations: ['slack'],
        supportPriority: 'priority',
        emailNotifications: true,
        webhookNotifications: false,
        customWebhooks: false,
        notificationHistoryDays: 365,
    },
    TEAM: {
        maxBrands: 50,
        maxKeywordsPerBrand: 999,
        analyticsLevel: 'detailed',
        historyDays: 9999, // Historique complet
        realTimeAlerts: true,
        exportReports: true,
        multiUser: 999, // Illimité
        integrations: ['slack', 'webhook'],
        supportPriority: 'dedicated',
        emailNotifications: true,
        webhookNotifications: true,
        customWebhooks: true,
        notificationHistoryDays: 9999,
    },
    ENTERPRISE: {
        maxBrands: 999,
        maxKeywordsPerBrand: 999,
        analyticsLevel: 'detailed',
        historyDays: 9999,
        realTimeAlerts: true,
        exportReports: true,
        multiUser: 999,
        integrations: ['slack', 'webhook', 'custom'],
        supportPriority: 'dedicated',
        emailNotifications: true,
        webhookNotifications: true,
        customWebhooks: true,
        notificationHistoryDays: 9999,
    },
};
