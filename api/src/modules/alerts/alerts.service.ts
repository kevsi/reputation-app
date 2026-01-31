import { prisma } from '../../shared/database/prisma.client';
import { AlertCondition, AlertLevel, AlertStatus } from '@sentinelle/database';
import { notificationsService } from '../notifications/notifications.service';

class AlertsService {
    /**
     * Récupère toutes les alertes d'une organisation
     */
    async getAllAlerts(organizationId: string) {
        return await prisma.alert.findMany({
            where: {
                brand: { organizationId }
            },
            include: { brand: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getAlertById(id: string) {
        return await prisma.alert.findUnique({
            where: { id },
            include: { brand: true, rules: true }
        });
    }

    /**
     * Historique des déclenchements
     */
    async getHistory(alertId: string, limit = 50) {
        return await prisma.alertTrigger.findMany({
            where: { alertId },
            include: { mention: true },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    async createAlert(input: any) {
        const { rules, ...alertData } = input;
        return await prisma.alert.create({
            data: {
                ...alertData,
                condition: alertData.condition as AlertCondition,
                level: (alertData.level || 'MEDIUM') as AlertLevel,
                rules: {
                    create: rules || []
                }
            }
        });
    }

    async updateAlert(id: string, input: any) {
        const { rules, ...alertData } = input;

        // Si des règles sont fournies, on les remplace (simplification)
        if (rules) {
            await prisma.alertRule.deleteMany({ where: { alertId: id } });
        }

        return await prisma.alert.update({
            where: { id },
            data: {
                ...alertData,
                condition: alertData.condition as AlertCondition,
                level: alertData.level as AlertLevel,
                status: alertData.status as AlertStatus,
                rules: rules ? {
                    create: rules
                } : undefined
            }
        });
    }

    async deleteAlert(id: string) {
        await prisma.alert.delete({ where: { id } });
        return true;
    }

    /**
     * Test d'une alerte sur les données existantes
     * (Simule le déclenchement sans créer de trigger réel)
     */
    async testAlert(id: string) {
        const alert = await this.getAlertById(id);
        if (!alert) throw new Error('Alert not found');

        // Logique simplifiée de test : on cherche les mentions qui matchent la condition
        const where: any = { brandId: alert.brandId };

        if (alert.condition === 'NEGATIVE_SENTIMENT_THRESHOLD') {
            where.sentiment = 'NEGATIVE';
            where.sentimentScore = { lte: -Math.abs(alert.threshold) };
        }

        const matchingMentions = await prisma.mention.findMany({
            where,
            take: 10,
            orderBy: { publishedAt: 'desc' }
        });

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
        const alert = await prisma.alert.findUnique({
            where: { id: alertId },
            include: { brand: { include: { organization: true } } }
        });

        if (!alert) return;

        // Créer une notification pour chaque utilisateur de l'organisation
        const users = await prisma.user.findMany({
            where: { organizationId: alert.brand.organizationId }
        });

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

export const alertsService = new AlertsService();
