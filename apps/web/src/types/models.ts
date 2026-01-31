/**
 * Type definitions for database models
 */

export type SourceType = 
  | 'FORUM' 
  | 'BLOG' 
  | 'NEWS' 
  | 'REVIEW' 
  | 'REDDIT' 
  | 'RSS' 
  | 'OTHER'
  // Legacy/closed APIs (disabled in UI)
  | 'TWITTER' 
  | 'FACEBOOK' 
  | 'INSTAGRAM' 
  | 'LINKEDIN'
  // Deprecated
  | 'TRUSTPILOT' 
  | 'GOOGLE_REVIEWS' 
  | 'YOUTUBE';

export interface SourceConfig {
  baseUrl?: string;
  searchPath?: string;
  queryParameter?: string;
  selectors?: {
    container?: string;
    title?: string;
    content?: string;
    author?: string;
    date?: string;
    rating?: string;
  };
  // Legacy fields (deprecated)
  companyName?: string;
  apiKey?: string;
  placeName?: string;
}

export interface Source {
  id: string;
  brandId: string;
  type: SourceType;
  name: string;
  isActive: boolean;
  config: SourceConfig;
  keywords: string[];
  scrapingFrequency: number; // in milliseconds
  lastScrapedAt: Date | null;
  errorCount: number;
  lastError?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mention {
  id: string;
  sourceId: string;
  source?: {
    id: string;
    name: string;
    type: SourceType;
  };
  externalId: string;
  content: string;
  author: string;
  url: string;
  sentiment: SentimentType;
  sentimentScore: number;
  collectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Keyword {
  id: string;
  brandId: string;
  name: string;
  createdAt: Date;
}

export interface MentionKeyword {
  id: string;
  mentionId: string;
  keywordId: string;
  createdAt: Date;
}

export type SentimentType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string | null;
  isActive: boolean;
  organization?: {
    id: string;
    name: string;
    slug: string;
    subscription?: {
      plan: string;
      status: string;
    } | null;
  } | null;
}

export interface Brand {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
