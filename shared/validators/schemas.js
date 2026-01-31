"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.createReportSchema = exports.updateActionSchema = exports.createActionSchema = exports.updateAlertSchema = exports.createAlertSchema = exports.updateKeywordSchema = exports.createKeywordSchema = exports.createMentionSchema = exports.updateSourceSchema = exports.createSourceSchema = exports.updateBrandSchema = exports.createBrandSchema = exports.updateUserSchema = exports.createUserSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// ========================================
// AUTH SCHEMAS
// ========================================
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    organizationName: zod_1.z.string().min(2, 'Organization name is required'),
});
// ========================================
// ORGANIZATION SCHEMAS
// ========================================
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    industry: zod_1.z.string().optional(),
    numberTeam: zod_1.z.string().optional(),
    subscriptionTier: zod_1.z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).default('FREE'),
});
exports.updateOrganizationSchema = exports.createOrganizationSchema.partial();
// ========================================
// USER SCHEMAS
// ========================================
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    role: zod_1.z.enum(['USER', 'ADMIN']).default('USER'),
    organizationId: zod_1.z.string().uuid('Invalid organization ID'),
});
exports.updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    name: zod_1.z.string().min(2).optional(),
    role: zod_1.z.enum(['USER', 'ADMIN']).optional(),
    isActive: zod_1.z.boolean().optional(),
});
// ========================================
// BRAND SCHEMAS
// ========================================
exports.createBrandSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    website: zod_1.z.string().url('Invalid URL').optional(),
    logo: zod_1.z.string().url('Invalid logo URL').optional(),
    organizationId: zod_1.z.string().uuid('Invalid organization ID'),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateBrandSchema = exports.createBrandSchema.partial().omit({ organizationId: true });
// ========================================
// SOURCE SCHEMAS
// ========================================
exports.createSourceSchema = zod_1.z.object({
    type: zod_1.z.enum(['REDDIT', 'TWITTER', 'DISCORD', 'OTHER']),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    keywords: zod_1.z.array(zod_1.z.string()).min(1, 'At least one keyword is required'),
    organizationId: zod_1.z.string().uuid('Invalid organization ID'),
    brandId: zod_1.z.string().uuid('Invalid brand ID').optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateSourceSchema = exports.createSourceSchema.partial().omit({ organizationId: true });
// ========================================
// MENTION SCHEMAS
// ========================================
exports.createMentionSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Text is required'),
    author: zod_1.z.string().min(1, 'Author is required'),
    url: zod_1.z.string().url('Invalid URL'),
    sourceId: zod_1.z.string().uuid('Invalid source ID'),
    organizationId: zod_1.z.string().uuid('Invalid organization ID'),
});
// ========================================
// KEYWORD SCHEMAS
// ========================================
exports.createKeywordSchema = zod_1.z.object({
    keyword: zod_1.z.string().min(1, 'Keyword is required'),
    priority: zod_1.z.number().int().min(1).max(10).default(1),
    organizationId: zod_1.z.string().uuid('Invalid organization ID'),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateKeywordSchema = exports.createKeywordSchema.partial().omit({ organizationId: true });
// ========================================
// ALERT SCHEMAS
// ========================================
exports.createAlertSchema = zod_1.z.object({
    level: zod_1.z.enum(['LOW', 'MEDIUM', 'CRITICAL']),
    type: zod_1.z.string().min(1, 'Type is required'),
    message: zod_1.z.string().min(1, 'Message is required'),
    mentionId: zod_1.z.string().uuid('Invalid mention ID'),
    organizationId: zod_1.z.string().uuid('Invalid organization ID'),
});
exports.updateAlertSchema = zod_1.z.object({
    status: zod_1.z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED']),
});
// ========================================
// ACTION SCHEMAS
// ========================================
exports.createActionSchema = zod_1.z.object({
    type: zod_1.z.enum(['RESPONSE', 'PRIVATE_MESSAGE', 'ARTICLE']),
    description: zod_1.z.string().min(1, 'Description is required'),
    organizationId: zod_1.z.string().uuid('Invalid organization ID'),
    alertId: zod_1.z.string().uuid('Invalid alert ID').optional(),
    assignedToId: zod_1.z.string().uuid('Invalid user ID').optional(),
});
exports.updateActionSchema = zod_1.z.object({
    description: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
    completedAt: zod_1.z.date().optional(),
});
// ========================================
// REPORT SCHEMAS
// ========================================
exports.createReportSchema = zod_1.z.object({
    type: zod_1.z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    organizationId: zod_1.z.string().uuid('Invalid organization ID'),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
});
// ========================================
// PAGINATION SCHEMA
// ========================================
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
