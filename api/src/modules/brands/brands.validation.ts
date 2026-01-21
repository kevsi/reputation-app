
import { z } from 'zod';

export const createBrandSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    description: z.string().max(500).optional(),
    website: z.string().url().optional().or(z.literal('')),
    logo: z.string().url().optional(),
    isActive: z.boolean().optional().default(true),
    organizationId: z.string(),
});

export const updateBrandSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).optional(),
    website: z.string().url().optional().or(z.literal('')),
    logo: z.string().url().optional(),
    isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
