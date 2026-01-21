import { z } from 'zod';

export const createActionSchema = z.object({
    type: z.enum(['takedown', 'contact', 'ignore', 'flag', 'monitor']),
    targetId: z.string(),
    performerId: z.string(),
    details: z.string().max(1000).optional(),
});

export const updateActionSchema = z.object({
    status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']).optional(),
    details: z.string().max(1000).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
