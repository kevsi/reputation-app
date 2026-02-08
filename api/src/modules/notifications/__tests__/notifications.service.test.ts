import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { notificationsService } from '../notifications.service';
import { prisma } from '../../../shared/database/prisma.client';
import { billingService } from '../../billing/billing.service';

// Mock des dépendances
jest.mock('../../../shared/database/prisma.client', () => ({
    prisma: {
        notification: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            updateMany: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
        notificationPreference: {
            findMany: jest.fn(),
            upsert: jest.fn(),
        },
    },
}));

jest.mock('../../billing/billing.service');
jest.mock('../../../infrastructure/queue/notifications.queue');
jest.mock('../../../infrastructure/email/email.service');
jest.mock('../../../infrastructure/websocket/websocket.service');

describe('NotificationsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserNotifications', () => {
        it('should return user notifications with pagination', async () => {
            const mockNotifications = [
                {
                    id: '1',
                    userId: 'user1',
                    type: 'NEW_MENTION',
                    title: 'New mention',
                    message: 'You have a new mention',
                    isRead: false,
                    createdAt: new Date(),
                },
            ];

            (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);
            (prisma.notification.count as jest.Mock).mockResolvedValue(1);

            const result = await notificationsService.getUserNotifications('user1', {
                limit: 10,
                offset: 0,
            });

            expect(result.notifications).toEqual(mockNotifications);
            expect(result.total).toBe(1);
            expect(result.unreadCount).toBe(0); // Mocked to return 0
            expect(prisma.notification.findMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                orderBy: { createdAt: 'desc' },
                take: 10,
                skip: 0,
            });
        });

        it('should filter unread notifications only', async () => {
            const mockNotifications = [
                {
                    id: '1',
                    userId: 'user1',
                    type: 'NEW_MENTION',
                    title: 'New mention',
                    message: 'You have a new mention',
                    isRead: false,
                    createdAt: new Date(),
                },
            ];

            (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);
            (prisma.notification.count as jest.Mock).mockResolvedValue(1);

            await notificationsService.getUserNotifications('user1', {
                unreadOnly: true,
            });

            expect(prisma.notification.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: 'user1',
                        isRead: false,
                    },
                })
            );
        });
    });

    describe('getUnreadCount', () => {
        it('should return the count of unread notifications', async () => {
            (prisma.notification.count as jest.Mock).mockResolvedValue(5);

            const count = await notificationsService.getUnreadCount('user1');

            expect(count).toBe(5);
            expect(prisma.notification.count).toHaveBeenCalledWith({
                where: { userId: 'user1', isRead: false },
            });
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

            const result = await notificationsService.markAsRead('notif1', 'user1');

            expect(result).toBe(true);
            expect(prisma.notification.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'notif1',
                    userId: 'user1',
                    isRead: false,
                },
                data: { isRead: true },
            });
        });

        it('should return false if notification not found', async () => {
            (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

            const result = await notificationsService.markAsRead('notif1', 'user1');

            expect(result).toBe(false);
        });
    });

    describe('createNotification', () => {
        it('should create a notification and queue it for sending', async () => {
            const mockNotification = {
                id: 'notif1',
                userId: 'user1',
                organizationId: 'org1',
                type: 'NEW_MENTION',
                title: 'New mention',
                message: 'You have a new mention',
                data: { mentionId: '123' },
            };

            (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

            const result = await notificationsService.createNotification({
                userId: 'user1',
                organizationId: 'org1',
                type: 'NEW_MENTION',
                title: 'New mention',
                message: 'You have a new mention',
                data: { mentionId: '123' },
            });

            expect(result).toBe('notif1');
            expect(prisma.notification.create).toHaveBeenCalledWith({
                data: mockNotification,
            });
        });
    });

    describe('getPlanLimits', () => {
        it('should return correct limits for FREE plan', async () => {
            (billingService.getSubscription as jest.Mock).mockResolvedValue({
                plan: 'FREE',
            });

            // Access private method for testing
            const service = notificationsService as any;
            const limits = await service.getPlanLimits('org1');

            expect(limits).toEqual({
                emailDailyLimit: 0,
                webhookMonthlyLimit: 0,
                canUseWebhooks: false,
                canCustomizeEmails: false,
            });
        });

        it('should return correct limits for PREMIUM plan', async () => {
            (billingService.getSubscription as jest.Mock).mockResolvedValue({
                plan: 'PREMIUM',
            });

            const service = notificationsService as any;
            const limits = await service.getPlanLimits('org1');

            expect(limits).toEqual({
                emailDailyLimit: 1000,
                webhookMonthlyLimit: 0,
                canUseWebhooks: false,
                canCustomizeEmails: true,
            });
        });

        it('should return correct limits for TEAM plan', async () => {
            (billingService.getSubscription as jest.Mock).mockResolvedValue({
                plan: 'TEAM',
            });

            const service = notificationsService as any;
            const limits = await service.getPlanLimits('org1');

            expect(limits).toEqual({
                emailDailyLimit: 1000,
                webhookMonthlyLimit: 10000,
                canUseWebhooks: true,
                canCustomizeEmails: true,
            });
        });
    });

    describe('checkPlanLimits', () => {
        it('should throw error for email on STARTER plan', async () => {
            (billingService.getSubscription as jest.Mock).mockResolvedValue({
                plan: 'STARTER',
            });

            const service = notificationsService as any;

            await expect(
                service.checkPlanLimits('org1', { email: true })
            ).rejects.toThrow('Email notifications require Premium plan or higher');
        });

        it('should throw error for webhook on PREMIUM plan', async () => {
            (billingService.getSubscription as jest.Mock).mockResolvedValue({
                plan: 'PREMIUM',
            });

            const service = notificationsService as any;

            await expect(
                service.checkPlanLimits('org1', { webhook: true })
            ).rejects.toThrow('Webhooks require Team plan');
        });

        it('should not throw for valid configurations', async () => {
            (billingService.getSubscription as jest.Mock).mockResolvedValue({
                plan: 'TEAM',
            });

            const service = notificationsService as any;

            await expect(
                service.checkPlanLimits('org1', { email: true, webhook: true })
            ).resolves.not.toThrow();
        });
    });
});