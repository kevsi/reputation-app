/**
 * Types API pour les réponses et requêtes
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
}

// Reports
export interface Report {
  id: string;
  brandId: string;
  title: string;
  type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
  format: 'pdf' | 'html' | 'json';
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledReport {
  id: string;
  brandId: string;
  title: string;
  schedule: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dashboard
export interface DashboardStats {
  totalMentions: number;
  sentimentScore: number;
  mentionsPerDay: Array<{ date: string; count: number }>;
  sentimentDistribution: { positive: number; negative: number; neutral: number };
  topKeywords: Array<{ keyword: string; count: number }>;
  reputationTrend: number;
}

export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  status: 'ACTIVE' | 'PENDING' | 'RESOLVED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
}

// Mentions
export interface MentionDetail {
  id: string;
  author?: string;
  authorAvatar?: string;
  publishedAt: string;
  content: string;
  source?: { type: string };
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
  sentimentScore?: number | string | { score: number };
  detectedKeywords?: string[];
  status?: 'NEW' | 'TREATED' | 'IGNORED' | 'MONITORED';
  url?: string;
  externalId?: string;
}

export interface PaginatedMentions {
  items: MentionDetail[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Brands
export interface BrandDetail {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sources
export interface SourceDetail {
  id: string;
  brandId: string;
  name: string;
  type: string;
  url?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Keywords
export interface KeywordDetail {
  id: string;
  brandId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Alerts
export interface AlertDetail {
  id: string;
  brandId: string;
  title: string;
  description?: string;
  triggerCondition: string;
  status: 'ACTIVE' | 'INACTIVE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recipients?: string[];
  createdAt: string;
  updatedAt: string;
}

// User & Auth
export interface UserDetail {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
