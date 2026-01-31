import { prisma } from '../../shared/database/prisma.client';
import { logger } from '../../infrastructure/logger';
import { notificationQueue } from '../../infrastructure/queue/notifications.queue';
import { billingService } from '../billing/billing.service';
import { PLAN_CONFIG } from '../../config/plans';
import {
    CreateNotificationInput,
    UpdateNotificationPreferenceInput,
    NotificationLimits
} from './notifications.types';

class NotificationsService {
    /**
     * Récupère les notifications d'un utilisateur
     */
    async getUserNotifications(userId: string, options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}) {
        const { limit = 50, offset = 0, unreadOnly = false } = options;

        const where = {
            userId,
            ...(unreadOnly && { isRead: false })
        };

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.notification.count({ where })
        ]);

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        return {
            notifications,
            total,
            unreadCount,
            hasMore: offset + limit < total
        };
    }

    /**
     * Récupère le nombre de notifications non lues
     */
    async getUnreadCount(userId: string): Promise<number> {
        return await prisma.notification.count({
            where: { userId, isRead: false }
        });
    }

    /**
     * Marque une notification comme lue
     */
    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        const result = await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
                isRead: false
            },
            data: { isRead: true }
        });

        return result.count > 0;
    }

    /**
     * Marque toutes les notifications comme lues
     */
    async markAllAsRead(userId: string): Promise<number> {
        const result = await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: { isRead: true }
        });

        return result.count;
    }

    /**
     * Supprime une notification
     */
    async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
        const result = await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId
            }
        });

        return result.count > 0;
    }

    /**
     * Récupère les préférences de notification
     */
    async getNotificationPreferences(userId: string, organizationId: string) {
        return await prisma.notificationPreference.findMany({
            where: { userId, organizationId }
        });
    }

    /**
     * Met à jour les préférences de notification
     */
    async updateNotificationPreference(
        userId: string,
        organizationId: string,
        input: UpdateNotificationPreferenceInput
    ) {
        // Vérifier les limites du plan
        await this.checkPlanLimits(organizationId, input);

        return await prisma.notificationPreference.upsert({
            where: {
                userId_organizationId_type: {
                    userId,
                    organizationId,
                    type: input.type
                }
            },
            update: input,
            create: {
                userId,
                organizationId,
                ...input
            }
        });
    }

    /**
     * Crée une nouvelle notification
     */
    async createNotification(input: CreateNotificationInput): Promise<string> {
        const notification = await prisma.notification.create({
            data: input
        });

        // Envoyer la notification de manière asynchrone
        await this.sendNotification(notification.id);

        return notification.id;
    }

    /**
     * Envoie une notification via les canaux appropriés
     */
    private async sendNotification(notificationId: string): Promise<void> {
        try {
            const notification = await prisma.notification.findUnique({
                where: { id: notificationId },
                select: {
                    userId: true,
                    organizationId: true,
                    type: true,
                    title: true,
                    message: true,
                    user: true
                }
            });

            if (!notification) return;

            // Récupérer les préférences
            const preferences = await this.getNotificationPreferences(
                notification.userId,
                notification.organizationId
            );

            const preference = preferences.find((p: any) => p.type === notification.type) || {
                inApp: true,
                email: false,
                webhook: false
            };

            // Vérifier les limites du plan
            const limits = await this.getPlanLimits(notification.organizationId);

            // Envoyer via les canaux activés et autorisés
            const channels: string[] = [];
            if (preference.inApp) channels.push('in_app');
            if (preference.email && limits.canUseWebhooks) channels.push('email'); // Note: email requires premium+
            if (preference.webhook && limits.canUseWebhooks && preference.webhookUrl) channels.push('webhook');

            // Ajouter à la queue pour traitement asynchrone
            await notificationQueue.add('send-notification', {
                notificationId,
                channels,
                preference
            });

        } catch (error) {
            logger.error('Error sending notification:', error);
        }
    }

    /**
     * Récupère les limites du plan pour les notifications
     */
    private async getPlanLimits(organizationId: string): Promise<NotificationLimits> {
        const subscription = await billingService.getSubscription(organizationId);
        const tier = subscription?.plan || 'FREE';
        const config = PLAN_CONFIG[tier];

        return {
            emailDailyLimit: config.emailNotifications ? 1000 : 0, // Ajuster selon les besoins
            webhookMonthlyLimit: config.webhookNotifications ? 10000 : 0,
            canUseWebhooks: config.webhookNotifications,
            canCustomizeEmails: config.emailNotifications
        };
    }

    /**
     * Vérifie les limites du plan avant mise à jour des préférences
     */
    private async checkPlanLimits(organizationId: string, input: UpdateNotificationPreferenceInput): Promise<void> {
        const limits = await this.getPlanLimits(organizationId);

        if (input.email && !limits.canCustomizeEmails) {
            throw new Error('Email notifications require Premium plan or higher');
        }

        if (input.webhook && !limits.canUseWebhooks) {
            throw new Error('Webhooks require Team plan');
        }
    }

    /**
     * Nettoie les anciennes notifications (job périodique)
     */
    async cleanupOldNotifications(daysOld: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await prisma.notification.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
                isRead: true
            }
        });

        logger.info(`Cleaned up ${result.count} old notifications`);
        return result.count;
    }
}

export const notificationsService = new NotificationsService();