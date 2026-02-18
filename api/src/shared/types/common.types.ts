/**
 * Types communs utilisés dans toute l'application
 */

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export enum SentimentType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  MIXED = 'MIXED',
}

export enum PlanType {
  STARTER = 'STARTER',
  PREMIUM = 'PREMIUM',
  TEAM = 'TEAM',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
}

export enum ActionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
}
