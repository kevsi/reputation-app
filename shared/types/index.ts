// ========================================
// SHARED TYPES - Utilisés par API et Frontend
// ========================================

// ========================================
// ENUMS
// ========================================

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export enum SourceType {
    TWITTER = 'TWITTER',
    FACEBOOK = 'FACEBOOK',
    INSTAGRAM = 'INSTAGRAM',
    LINKEDIN = 'LINKEDIN',
    GOOGLE_REVIEWS = 'GOOGLE_REVIEWS',
    TRUSTPILOT = 'TRUSTPILOT',
    TRIPADVISOR = 'TRIPADVISOR',
    YOUTUBE = 'YOUTUBE',
    REDDIT = 'REDDIT',
    NEWS = 'NEWS',
    BLOG = 'BLOG',
    FORUM = 'FORUM',
    RSS = 'RSS',
    OTHER = 'OTHER',
}

export enum Sentiment {
    POSITIVE = 'POSITIVE',
    NEUTRAL = 'NEUTRAL',
    NEGATIVE = 'NEGATIVE',
}

export enum AlertLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
}

export enum ActionType {
    RESPONSE = 'RESPONSE',
    PRIVATE_MESSAGE = 'PRIVATE_MESSAGE',
    ARTICLE = 'ARTICLE',
}

export enum ReportType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
}

export enum SubscriptionTier {
    FREE = 'FREE',
    STARTER = 'STARTER',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE',
}

// ========================================
// ENTITIES
// ========================================

export interface Organization {
    id: string;
    name: string;
    industry?: string;
    numberTeam?: string;
    subscriptionTier: SubscriptionTier;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    role: Role;
    isActive: boolean;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Brand {
    id: string;
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    isActive: boolean;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Source {
    id: string;
    type: SourceType;
    name: string;
    keywords: string[];
    isActive: boolean;
    organizationId: string;
    brandId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Mention {
    id: string;
    text: string;
    author: string;
    url: string;
    sourceId: string;
    sentiment?: Sentiment;
    sentimentScore?: number;
    emotions: string[];
    viralityScore?: number;
    organizationId: string;
    createdAt: Date;
    analyzedAt?: Date;
}

export interface Keyword {
    id: string;
    keyword: string;
    priority: number;
    isActive: boolean;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Alert {
    id: string;
    level: AlertLevel;
    type: string;
    message: string;
    status: AlertStatus;
    mentionId: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Action {
    id: string;
    type: ActionType;
    description: string;
    status: string;
    alertId?: string;
    organizationId: string;
    assignedToId?: string;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Report {
    id: string;
    type: ReportType;
    status: string;
    fileUrl?: string;
    organizationId: string;
    startDate: Date;
    endDate: Date;
    generatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Trend {
    id: string;
    date: Date;
    type: string;
    totalMentions: number;
    positiveMentions: number;
    neutralMentions: number;
    negativeMentions: number;
    averageSentimentScore: number;
    averageViralityScore: number;
    sourceBreakdown: Record<string, any>;
    topEmotions: string[];
    organizationId: string;
    createdAt: Date;
}

// ========================================
// API RESPONSES
// ========================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
