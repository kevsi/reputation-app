/**
 * 📋 Notifications
 */
export type NotificationType = 'NEW_MENTION' | 'ALERT_TRIGGERED' | 'SENTIMENT_SPIKE' | 'ACTION_REQUIRED' | 'REPORT_READY' | 'KEYWORD_TRENDING';

export type NotificationChannel = 'in_app' | 'email' | 'webhook';

export interface Notification {
    id: string;
    userId: string;
    organizationId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: Date;
}

export interface NotificationPreference {
    id: string;
    userId: string;
    organizationId: string;
    type: NotificationType;
    inApp: boolean;
    email: boolean;
    webhook: boolean;
    webhookUrl?: string;
}

export interface CreateNotificationInput {
    userId: string;
    organizationId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}

export interface UpdateNotificationPreferenceInput {
    type: NotificationType;
    inApp?: boolean;
    email?: boolean;
    webhook?: boolean;
    webhookUrl?: string;
}

export interface NotificationResponse {
    success: boolean;
    data: Notification;
}

export interface NotificationsResponse {
    success: boolean;
    data: Notification[];
    count: number;
    unreadCount: number;
}

export interface NotificationPreferencesResponse {
    success: boolean;
    data: NotificationPreference[];
}

export interface SendNotificationOptions {
    channels?: NotificationChannel[];
    priority?: 'low' | 'normal' | 'high';
    retryCount?: number;
}

// Plan-based notification limits
export interface NotificationLimits {
    emailDailyLimit: number;
    webhookMonthlyLimit: number;
    canUseWebhooks: boolean;
    canCustomizeEmails: boolean;
}