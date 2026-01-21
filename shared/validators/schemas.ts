import { z } from 'zod';

// ========================================
// AUTH SCHEMAS
// ========================================

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    organizationName: z.string().min(2, 'Organization name is required'),
});

// ========================================
// ORGANIZATION SCHEMAS
// ========================================

export const createOrganizationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    industry: z.string().optional(),
    numberTeam: z.string().optional(),
    subscriptionTier: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).default('FREE'),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// ========================================
// USER SCHEMAS
// ========================================

export const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
    organizationId: z.string().uuid('Invalid organization ID'),
});

export const updateUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(2).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
});

// ========================================
// BRAND SCHEMAS
// ========================================

export const createBrandSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    website: z.string().url('Invalid URL').optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    organizationId: z.string().uuid('Invalid organization ID'),
    isActive: z.boolean().default(true),
});

export const updateBrandSchema = createBrandSchema.partial().omit({ organizationId: true });

// ========================================
// SOURCE SCHEMAS
// ========================================

export const createSourceSchema = z.object({
    type: z.enum(['REDDIT', 'TWITTER', 'DISCORD', 'OTHER']),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
    organizationId: z.string().uuid('Invalid organization ID'),
    brandId: z.string().uuid('Invalid brand ID').optional(),
    isActive: z.boolean().default(true),
});

export const updateSourceSchema = createSourceSchema.partial().omit({ organizationId: true });

// ========================================
// MENTION SCHEMAS
// ========================================

export const createMentionSchema = z.object({
    text: z.string().min(1, 'Text is required'),
    author: z.string().min(1, 'Author is required'),
    url: z.string().url('Invalid URL'),
    sourceId: z.string().uuid('Invalid source ID'),
    organizationId: z.string().uuid('Invalid organization ID'),
});

// ========================================
// KEYWORD SCHEMAS
// ========================================

export const createKeywordSchema = z.object({
    keyword: z.string().min(1, 'Keyword is required'),
    priority: z.number().int().min(1).max(10).default(1),
    organizationId: z.string().uuid('Invalid organization ID'),
    isActive: z.boolean().default(true),
});

export const updateKeywordSchema = createKeywordSchema.partial().omit({ organizationId: true });

// ========================================
// ALERT SCHEMAS
// ========================================

export const createAlertSchema = z.object({
    level: z.enum(['LOW', 'MEDIUM', 'CRITICAL']),
    type: z.string().min(1, 'Type is required'),
    message: z.string().min(1, 'Message is required'),
    mentionId: z.string().uuid('Invalid mention ID'),
    organizationId: z.string().uuid('Invalid organization ID'),
});

export const updateAlertSchema = z.object({
    status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED']),
});

// ========================================
// ACTION SCHEMAS
// ========================================

export const createActionSchema = z.object({
    type: z.enum(['RESPONSE', 'PRIVATE_MESSAGE', 'ARTICLE']),
    description: z.string().min(1, 'Description is required'),
    organizationId: z.string().uuid('Invalid organization ID'),
    alertId: z.string().uuid('Invalid alert ID').optional(),
    assignedToId: z.string().uuid('Invalid user ID').optional(),
});

export const updateActionSchema = z.object({
    description: z.string().optional(),
    status: z.string().optional(),
    assignedToId: z.string().uuid().optional(),
    completedAt: z.date().optional(),
});

// ========================================
// REPORT SCHEMAS
// ========================================

export const createReportSchema = z.object({
    type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    organizationId: z.string().uuid('Invalid organization ID'),
    startDate: z.date(),
    endDate: z.date(),
});

// ========================================
// PAGINATION SCHEMA
// ========================================

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
