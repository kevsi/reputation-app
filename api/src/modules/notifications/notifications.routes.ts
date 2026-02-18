import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { updateNotificationPreferenceSchema } from './notifications.validation';

const router: Router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes des notifications
router.get('/', notificationsController.getNotifications.bind(notificationsController));
router.get('/unread', notificationsController.getUnreadCount.bind(notificationsController));
router.patch('/:id/read', notificationsController.markAsRead.bind(notificationsController));
router.patch('/read-all', notificationsController.markAllAsRead.bind(notificationsController));
router.delete('/:id', notificationsController.deleteNotification.bind(notificationsController));

// Routes des préférences
router.get('/preferences', notificationsController.getPreferences.bind(notificationsController));
router.put('/preferences', validate(updateNotificationPreferenceSchema), notificationsController.updatePreferences.bind(notificationsController));

export default router;
