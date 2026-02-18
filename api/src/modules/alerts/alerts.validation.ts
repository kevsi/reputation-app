
import { z } from 'zod';

const conditionEnum = z.enum(['NEGATIVE_SENTIMENT_THRESHOLD', 'KEYWORD_FREQUENCY', 'MENTION_SPIKE', 'SENTIMENT_DROP']);
const severityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const createAlertSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    description: z.string().max(500).optional(),
    condition: conditionEnum,
    threshold: z.number(),
    severity: severityEnum.optional().default('MEDIUM'),
    isActive: z.boolean().optional().default(true),
    brandId: z.string(),
});

export const updateAlertSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).optional(),
    condition: conditionEnum.optional(),
    threshold: z.number().optional(),
    severity: severityEnum.optional(),
    isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
