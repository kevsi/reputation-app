
import { z } from 'zod';

export const createKeywordSchema = z.object({
    word: z.string().min(1).max(100).trim(),
    category: z.string().max(50).optional(),
    priority: z.number().int().min(0).max(10).optional().default(0),
    isNegative: z.boolean().optional().default(false),
    brandId: z.string(),
});

export const updateKeywordSchema = z.object({
    word: z.string().min(1).max(100).trim().optional(),
    category: z.string().max(50).optional(),
    priority: z.number().int().min(0).max(10).optional(),
    isNegative: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>;
export type UpdateKeywordInput = z.infer<typeof updateKeywordSchema>;
