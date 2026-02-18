/**
 * Types pour le module Sources
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */

export type SourceType =
  | 'GOOGLE_REVIEWS'
  | 'TRUSTPILOT'
  | 'TRIPADVISOR'
  | 'FACEBOOK'
  | 'TWITTER'
  | 'INSTAGRAM'
  | 'NEWS'
  | 'RSS'
  | 'REDDIT'
  | 'YOUTUBE';

export type SourceStatus = 'ACTIVE' | 'PAUSED' | 'ERROR' | 'RATE_LIMITED' | 'DELETED';

export type ScrapingFrequency =
  | 'REALTIME'
  | 'EVERY_15_MIN'
  | 'HOURLY'
  | 'EVERY_6_HOURS'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY';

export interface SourceConfig {
  placeId?: string;
  googleApiKey?: string;
  companyUrl?: string;
  maxPages?: number;
  username?: string;
  hashtags?: string[];
  twitterBearerToken?: string;
  keywords?: string[];
  language?: string;
  newsApiKey?: string;
  feedUrl?: string;
  subreddits?: string[];
  redditClientId?: string;
  redditClientSecret?: string;
  maxResults?: number;
  includeReplies?: boolean;
  minRating?: number;
}

export interface CreateSourceDTO {
  type: SourceType;
  name: string;
  config: SourceConfig;
  scrapingFrequency?: ScrapingFrequency;
}

export interface UpdateSourceDTO {
  name?: string;
  config?: Partial<SourceConfig>;
  scrapingFrequency?: ScrapingFrequency;
  status?: SourceStatus;
}
