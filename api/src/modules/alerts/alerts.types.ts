
/**
 * 📋 Alerts
 */
export type AlertCondition = 'NEGATIVE_SENTIMENT_THRESHOLD' | 'KEYWORD_FREQUENCY' | 'MENTION_SPIKE' | 'SENTIMENT_DROP';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Alert {
    id: string;
    name: string;
    description?: string;
    condition: AlertCondition;
    threshold: number;
    severity: AlertSeverity;
    isActive: boolean;
    lastTriggeredAt?: Date;
    brandId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AlertsResponse {
    success: boolean;
    data: Alert[];
    count: number;
}

export interface AlertResponse {
    success: boolean;
    data: Alert;
}

export interface CreateAlertInput {
    name: string;
    description?: string;
    condition: AlertCondition;
    threshold: number;
    severity?: AlertSeverity;
    isActive?: boolean;
    brandId: string;
}

export interface UpdateAlertInput {
    name?: string;
    description?: string;
    condition?: AlertCondition;
    threshold?: number;
    severity?: AlertSeverity;
    isActive?: boolean;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}
