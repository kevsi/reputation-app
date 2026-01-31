import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';

class NotificationsController {
    /**
     * Liste les notifications de l'utilisateur connecté
     */
    async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Ajout de logs pour debug
            // eslint-disable-next-line no-console
            console.log('[NOTIF][getNotifications] req.user:', req.user);
            // eslint-disable-next-line no-console
            console.log('[NOTIF][getNotifications] req.query:', req.query);

            const userId = req.user?.userId;
            if (!userId) {
                // eslint-disable-next-line no-console
                console.error('[NOTIF][getNotifications] userId manquant dans req.user');
                res.status(400).json({ success: false, message: 'userId manquant dans le token' });
                return;
            }
            const { limit, offset, unreadOnly } = req.query;

            const result = await notificationsService.getUserNotifications(userId, {
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined,
                unreadOnly: unreadOnly === 'true'
            });

            res.status(200).json({
                success: true,
                data: result.notifications,
                count: result.total,
                unreadCount: result.unreadCount,
                hasMore: result.hasMore
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupère le nombre de notifications non lues
     */
    async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const count = await notificationsService.getUnreadCount(userId);

            res.status(200).json({
                success: true,
                data: { unreadCount: count }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marque une notification comme lue
     */
    async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            const success = await notificationsService.markAsRead(id, userId);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found or already read'
                });
                return;
            }

            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marque toutes les notifications comme lues
     */
    async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const count = await notificationsService.markAllAsRead(userId);

            res.status(200).json({
                success: true,
                data: { markedAsRead: count }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Supprime une notification
     */
    async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            const success = await notificationsService.deleteNotification(id, userId);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
                return;
            }

            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupère les préférences de notification
     */
    async getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const organizationId = req.user!.organizationId!;

            const preferences = await notificationsService.getNotificationPreferences(userId, organizationId);

            res.status(200).json({
                success: true,
                data: preferences
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Met à jour les préférences de notification
     */
    async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const organizationId = req.user!.organizationId!;
            const input = req.body;

            const preference = await notificationsService.updateNotificationPreference(
                userId,
                organizationId,
                input
            );

            res.status(200).json({
                success: true,
                data: preference
            });
        } catch (error) {
            next(error);
        }
    }
}

export const notificationsController = new NotificationsController();