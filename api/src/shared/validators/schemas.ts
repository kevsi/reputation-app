import { z } from 'zod';
import {
  Role,
  SubscriptionTier,
  SourceType,
  AlertLevel,
  AlertStatus,
  AlertCondition,
  SentimentType,
  ActionStatus,
  ReportType
} from '@sentinelle/database';

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1, 'Name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

// ==========================================
// USER SCHEMAS
// ==========================================

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(Role).optional().default(Role.USER),
  organizationId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().url().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

// ==========================================
// ORGANIZATION SCHEMAS
// ==========================================

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  slug: z.string().min(1).optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  numberTeam: z.string().optional(),
  subscriptionTier: z.nativeEnum(SubscriptionTier).optional().default(SubscriptionTier.FREE),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  numberTeam: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role).optional().default(Role.USER),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

// ==========================================
// BRAND SCHEMAS
// ==========================================

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  organizationId: z.string(),
  isActive: z.boolean().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isActive: z.boolean().optional(),
});

export const addCompetitorSchema = z.object({
  competitorId: z.string(),
});

// ==========================================
// SOURCE SCHEMAS
// ==========================================

export const createSourceSchema = z.object({
  type: z.nativeEnum(SourceType),
  name: z.string().min(1, 'Source name is required'),
  url: z.string().url().optional().or(z.literal('')),
  username: z.string().optional(),
  accessToken: z.string().optional(),
  scrapingFrequency: z.number().int().positive().optional(),
  brandId: z.string(),
  isActive: z.boolean().optional(),
});

export const updateSourceSchema = z.object({
  type: z.nativeEnum(SourceType).optional(),
  name: z.string().min(1).optional(),
  url: z.string().url().optional().or(z.literal('')),
  username: z.string().optional(),
  accessToken: z.string().optional(),
  scrapingFrequency: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const validateSourceSchema = z.object({
  type: z.nativeEnum(SourceType),
  url: z.string().url(),
});

export const discoverSourcesSchema = z.object({
  topic: z.string().min(1),
  industry: z.string().optional(),
});

// ==========================================
// KEYWORD SCHEMAS
// ==========================================

export const createKeywordSchema = z.object({
  word: z.string().min(1, 'Keyword is required'),
  category: z.string().optional(),
  priority: z.number().int().min(0).max(10).optional(),
  isNegative: z.boolean().optional(),
  brandId: z.string(),
  isActive: z.boolean().optional(),
});

export const updateKeywordSchema = z.object({
  word: z.string().min(1).optional(),
  category: z.string().optional(),
  priority: z.number().int().min(0).max(10).optional(),
  isNegative: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const bulkCreateKeywordsSchema = z.object({
  keywords: z.array(z.object({
    word: z.string().min(1),
    category: z.string().optional(),
    priority: z.number().int().optional(),
    isNegative: z.boolean().optional(),
  })),
  brandId: z.string(),
});

export const keywordSuggestionsSchema = z.object({
  term: z.string().min(1),
  limit: z.number().int().positive().optional().default(10),
});

// ==========================================
// MENTION SCHEMAS
// ==========================================

export const createMentionSchema = z.object({
  content: z.string().min(1),
  author: z.string().optional(),
  authorUrl: z.string().url().optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
  sentiment: z.nativeEnum(SentimentType).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  language: z.string().optional(),
  publishedAt: z.string().datetime().or(z.date()),
  brandId: z.string(),
  sourceId: z.string(),
});

export const updateMentionSchema = z.object({
  content: z.string().min(1).optional(),
  sentiment: z.nativeEnum(SentimentType).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
});

export const searchMentionsSchema = z.object({
  q: z.string().optional(),
  sentiment: z.nativeEnum(SentimentType).optional(),
  sourceId: z.string().optional(),
  brandId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(20),
});

export const bulkUpdateSentimentSchema = z.object({
  mentionIds: z.array(z.string()),
  sentiment: z.nativeEnum(SentimentType),
});

// ==========================================
// ALERT SCHEMAS
// ==========================================

export const createAlertSchema = z.object({
  name: z.string().min(1, 'Alert name is required'),
  description: z.string().optional(),
  condition: z.nativeEnum(AlertCondition),
  threshold: z.number(),
  level: z.nativeEnum(AlertLevel).optional().default(AlertLevel.MEDIUM),
  status: z.nativeEnum(AlertStatus).optional().default(AlertStatus.NEW),
  brandId: z.string(),
  isActive: z.boolean().optional(),
});

export const updateAlertSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  condition: z.nativeEnum(AlertCondition).optional(),
  threshold: z.number().optional(),
  level: z.nativeEnum(AlertLevel).optional(),
  status: z.nativeEnum(AlertStatus).optional(),
  isActive: z.boolean().optional(),
});

export const createAlertRuleSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'contains', 'greater_than', 'less_than', 'not_equals']),
  value: z.string().min(1),
  alertId: z.string(),
});

export const bulkMarkReadSchema = z.object({
  alertIds: z.array(z.string()).optional(),
  triggerIds: z.array(z.string()).optional(),
});

export const alertDigestSchema = z.object({
  frequency: z.enum(['daily', 'weekly']),
  brandId: z.string().optional(),
});

// ==========================================
// ACTION SCHEMAS
// ==========================================

export const createActionSchema = z.object({
  title: z.string().min(1, 'Action title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(ActionStatus).optional().default(ActionStatus.PENDING),
  priority: z.number().int().min(0).max(10).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateActionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ActionStatus).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const batchActionsSchema = z.object({
  actionIds: z.array(z.string()).min(1),
  operation: z.enum(['complete', 'cancel', 'assign']),
  assignedToId: z.string().optional(),
});

// ==========================================
// REPORT SCHEMAS
// ==========================================

export const generateReportSchema = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(ReportType),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  brandId: z.string(),
  format: z.enum(['json', 'pdf', 'csv', 'xlsx']).optional().default('json'),
  metrics: z.array(z.string()).optional(),
});

export const scheduleReportSchema = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(ReportType),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  recipients: z.array(z.string().email()),
  brandId: z.string(),
  format: z.enum(['pdf', 'csv', 'xlsx']).optional().default('pdf'),
});

export const shareReportSchema = z.object({
  emails: z.array(z.string().email()).min(1),
  message: z.string().optional(),
});

export const compareReportsSchema = z.object({
  reportIds: z.array(z.string()).min(2).max(5),
});

// ==========================================
// WEBHOOK SCHEMAS
// ==========================================

export const createWebhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
  organizationId: z.string(),
  isActive: z.boolean().optional(),
});

export const updateWebhookSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  secret: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// INTEGRATION SCHEMAS
// ==========================================

export const createIntegrationSchema = z.object({
  type: z.enum(['slack', 'teams', 'email', 'zapier', 'discord']),
  name: z.string().min(1),
  config: z.record(z.any()),
  organizationId: z.string(),
  isActive: z.boolean().optional(),
});

export const updateIntegrationSchema = z.object({
  name: z.string().min(1).optional(),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// NOTIFICATION SCHEMAS
// ==========================================

export const createNotificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.string(),
  userId: z.string(),
  data: z.record(z.any()).optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  slack: z.boolean().optional(),
  inApp: z.boolean().optional(),
});

// ==========================================
// BILLING SCHEMAS
// ==========================================

export const subscribeSchema = z.object({
  planId: z.nativeEnum(SubscriptionTier),
  paymentMethodId: z.string().optional(),
});

export const upgradeSchema = z.object({
  newPlanId: z.nativeEnum(SubscriptionTier),
});

export const addPaymentMethodSchema = z.object({
  paymentMethodId: z.string(),
});

// ==========================================
// ANALYTICS SCHEMAS
// ==========================================

export const analyticsQuerySchema = z.object({
  brandId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).optional().default('day'),
  metrics: z.array(z.string()).optional(),
});

export const comparePeriodsSchema = z.object({
  brandId: z.string(),
  period1Start: z.string().datetime(),
  period1End: z.string().datetime(),
  period2Start: z.string().datetime(),
  period2End: z.string().datetime(),
});

// ==========================================
// EXPORT SCHEMAS
// ==========================================

export const exportDataSchema = z.object({
  type: z.enum(['mentions', 'alerts', 'analytics', 'reports']),
  format: z.enum(['csv', 'xlsx', 'json', 'pdf']),
  filters: z.record(z.any()).optional(),
  brandId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ==========================================
// SEARCH SCHEMAS
// ==========================================

export const globalSearchSchema = z.object({
  q: z.string().min(1),
  types: z.array(z.enum(['mentions', 'alerts', 'sources', 'brands', 'keywords'])).optional(),
  limit: z.number().int().positive().optional().default(20),
});

// ==========================================
// PAGINATION & SORTING
// ==========================================

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});