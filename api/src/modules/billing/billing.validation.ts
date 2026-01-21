import { z } from 'zod';

const tierEnum = z.enum(['FREE', 'STARTER', 'PRO', 'PREMIUM', 'TEAM', 'ENTERPRISE']);

export const subscribeSchema = z.object({
    organizationId: z.string(),
    tier: tierEnum,
});

export const confirmSubscriptionSchema = z.object({
    organizationId: z.string(),
    tier: tierEnum,
    stripeSubscriptionId: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
    tier: tierEnum.optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type ConfirmSubscriptionInput = z.infer<typeof confirmSubscriptionSchema>;
