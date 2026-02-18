
import { z } from 'zod';

const sentimentEnum = z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED']);

export const createMentionSchema = z.object({
    content: z.string().min(1),
    author: z.string().optional(),
    authorUrl: z.string().url().optional().or(z.literal('')),
    url: z.string().url().optional().or(z.literal('')),
    sentiment: sentimentEnum.optional().default('NEUTRAL'),
    sentimentScore: z.number().min(-1).max(1).optional(),
    language: z.string().optional(),
    publishedAt: z.string().pipe(z.coerce.date()),
    brandId: z.string(),
    sourceId: z.string(),
    platform: z.string(), // SourceType enum value
    externalId: z.string(), // ID unique sur la plateforme
});

export const updateMentionSchema = z.object({
    sentiment: sentimentEnum.optional(),
    sentimentScore: z.number().min(-1).max(1).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});



export const searchMentionsSchema = z.object({
    brandId: z.string().optional(),
    organizationId: z.string().optional(),
    sentiment: z.array(sentimentEnum).optional(),
    startDate: z.string().pipe(z.coerce.date()).optional(),
    endDate: z.string().pipe(z.coerce.date()).optional(),
    searchTerm: z.string().optional(),
    language: z.string().optional(),
    sourceType: z.array(z.string()).optional(),
    isProcessed: z.boolean().optional(),
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().optional().default(20),
});

export const batchActionSchema = z.object({
    ids: z.array(z.string()).min(1),
    action: z.enum(['DELETE', 'MARK_PROCESSED', 'UPDATE_SENTIMENT']),
    sentiment: sentimentEnum.optional(),
});

export type CreateMentionInput = z.infer<typeof createMentionSchema>;
export type UpdateMentionInput = z.infer<typeof updateMentionSchema>;
