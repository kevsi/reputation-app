import { z } from 'zod';

export const createActionSchema = z.object({
    title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne peut pas dépasser 255 caractères'),
    description: z.string().optional(),
    priority: z.number().int().min(1).max(4).default(2),
    type: z.enum(['RESPONSE', 'INVESTIGATION', 'COMMUNICATION', 'MONITORING']),
    dueDate: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING')
});

export const updateActionSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.number().int().min(1).max(4).optional(),
    type: z.enum(['RESPONSE', 'INVESTIGATION', 'COMMUNICATION', 'MONITORING']).optional(),
    dueDate: z.string().optional(),
    assignedTo: z.string().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
