import { Job } from 'bull';
import { PrismaClient } from '@sentinelle/database';

const prisma = new PrismaClient();

export const notificationsProcessor = async (job: Job) => {
    const { type, userId, title, message, data } = job.data;

    console.log(`🔔 Sending ${type} notification to user ${userId}: ${title}`);

    try {
        // 1. Fetch user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.warn(`⚠️ User ${userId} not found`);
            return;
        }

        // 2. Create notification in database
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data || {},
                isRead: false
            }
        });

        console.log(`📝 Notification created in DB: ${notification.id}`);

        // 3. Mock sending email if it's high priority or specific type
        if (type === 'ALERT' || type === 'CRITICAL') {
            console.log(`✉️ Sending urgent email to ${user.email}: [${title}] ${message}`);
        }

        return { success: true, notificationId: notification.id };
    } catch (error) {
        console.error(`❌ Notification failed for user ${userId}:`, error);
        throw error;
    }
};
