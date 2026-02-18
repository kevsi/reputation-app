import { z } from 'zod';

export const createReportSchema = z.object({
    title: z.string().min(3).max(100),
    type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
    format: z.enum(['pdf', 'csv', 'excel']),
    organizationId: z.string(),
});

export const updateReportSchema = z.object({
    title: z.string().min(3).max(100).optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    url: z.string().url().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
