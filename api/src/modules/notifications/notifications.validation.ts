import { z } from 'zod';

const notificationTypeEnum = z.enum([
    'NEW_MENTION',
    'ALERT_TRIGGERED',
    'SENTIMENT_SPIKE',
    'ACTION_REQUIRED',
    'REPORT_READY',
    'KEYWORD_TRENDING'
]);

const channelEnum = z.enum(['in_app', 'email', 'webhook']);

export const createNotificationSchema = z.object({
    userId: z.string().cuid(),
    organizationId: z.string().cuid(),
    type: notificationTypeEnum,
    title: z.string().min(1).max(200).trim(),
    message: z.string().min(1).max(1000).trim(),
    data: z.any().optional(),
});

export const updateNotificationPreferenceSchema = z.object({
    type: notificationTypeEnum,
    inApp: z.boolean().optional(),
    email: z.boolean().optional(),
    webhook: z.boolean().optional(),
    webhookUrl: z.string().url().optional(),
}).refine(data => {
    // If webhook is true, webhookUrl must be provided
    if (data.webhook && !data.webhookUrl) {
        return false;
    }
    return true;
}, {
    message: 'webhookUrl is required when webhook is enabled',
});

export const sendNotificationSchema = z.object({
    channels: z.array(channelEnum).optional().default(['in_app']),
    priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
    retryCount: z.number().min(0).max(5).optional().default(3),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationPreferenceInput = z.infer<typeof updateNotificationPreferenceSchema>;
export type SendNotificationOptions = z.infer<typeof sendNotificationSchema>;