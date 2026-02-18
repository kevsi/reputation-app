import { AlertCondition, AlertLevel, AlertStatus } from '@sentinelle/database';
import { notificationsService } from '../notifications/notifications.service';
import { AlertsRepository, alertsRepository } from './alerts.repository';
import { MentionsRepository, mentionsRepository } from '../mentions/mentions.repository';
import { PaginationParams, PaginatedResponse } from '@/shared/utils/pagination';

class AlertsService {
    constructor(
        private repository: AlertsRepository,
        private mentionsRepo: MentionsRepository
    ) { }

    /**
     * Récupère toutes les alertes d'une organisation avec pagination
     */
    async getAllAlerts(
        organizationId: string,
        pagination: PaginationParams
    ): Promise<PaginatedResponse<any>> {
        const page = Math.max(1, pagination.page || 1);
        const limit = Math.min(100, Math.max(1, pagination.limit || 20));
        const skip = (page - 1) * limit;

        const where = { brand: { organizationId } };

        const [data, total] = await Promise.all([
            this.repository.findMany(where, skip, limit),
            this.repository.count(where)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    async getAlertById(id: string) {
        return await this.repository.findById(id, {
            brand: true,
            rules: true
        });
    }

    /**
     * Historique des déclenchements
     */
    async getHistory(alertId: string, limit = 50) {
        return await this.repository.findTriggers({ alertId }, limit);
    }

    async createAlert(input: any) {
        const { rules, ...alertData } = input;
        return await this.repository.create({
            ...alertData,
            condition: alertData.condition as AlertCondition,
            level: (alertData.level || 'MEDIUM') as AlertLevel,
            rules: {
                create: rules || []
            }
        });
    }

    async updateAlert(id: string, input: any) {
        const { rules, ...alertData } = input;

        if (rules) {
            await this.repository.deleteRulesByAlertId(id);
        }

        return await this.repository.update(id, {
            ...alertData,
            condition: alertData.condition as AlertCondition,
            level: alertData.level as AlertLevel,
            status: alertData.status as AlertStatus,
            rules: rules ? {
                create: rules
            } : undefined
        });
    }

    async deleteAlert(id: string) {
        await this.repository.delete(id);
        return true;
    }

    /**
     * Test d'une alerte sur les données existantes
     */
    async testAlert(id: string) {
        const alert = await this.getAlertById(id);
        if (!alert) throw new Error('Alert not found');

        const where: any = { brandId: alert.brandId };

        if (alert.condition === 'NEGATIVE_SENTIMENT_THRESHOLD') {
            where.sentiment = 'NEGATIVE';
            where.sentimentScore = { lte: -Math.abs(alert.threshold) };
        }

        const matchingMentions = await this.mentionsRepo.findMany(where, 0, 10, { publishedAt: 'desc' });

        return {
            wouldTrigger: matchingMentions.length > 0,
            matchingCount: matchingMentions.length,
            sampleMentions: matchingMentions
        };
    }

    /**
     * Déclenche une notification pour une alerte
     */
    async triggerAlertNotification(alertId: string) {
        const alert: any = await this.getAlertById(alertId);

        if (!alert) return;

        const users = await this.repository.findUsersByOrganizationId(alert.brand.organizationId);

        for (const user of users) {
            await notificationsService.createNotification({
                userId: user.id,
                organizationId: alert.brand.organizationId,
                type: 'ALERT_TRIGGERED',
                title: `Alerte: ${alert.name}`,
                message: `Une alerte a été déclenchée pour la marque ${alert.brand.name}`,
                data: {
                    alertId,
                    brandId: alert.brand.id,
                    threshold: alert.threshold,
                    condition: alert.condition
                }
            });
        }
    }
}

export const alertsService = new AlertsService(alertsRepository, mentionsRepository);

