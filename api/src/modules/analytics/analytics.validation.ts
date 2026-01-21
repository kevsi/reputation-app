import { z } from 'zod';

export const getAnalyticsSchema = z.object({
    organizationId: z.string(),
    period: z.enum(['daily', 'weekly', 'monthly']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export type GetAnalyticsInput = z.infer<typeof getAnalyticsSchema>;
