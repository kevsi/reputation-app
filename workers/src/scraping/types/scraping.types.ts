import { SourceType } from '@sentinelle/database';

export interface ScrapedMention {
    title: string;
    content: string;
    author: string;
    publishedAt: Date;
    url: string;
    source: string;
    platform: SourceType;
    externalId: string;
    engagementCount?: number;
    authorUrl?: string;
    authorAvatar?: string;
    rawData?: Record<string, any>;
}

export interface SelectorConfig {
    container: string;
    title: string;
    content: string;
    author: string;
    date: string;
    link?: string;
    nextPage?: string;
}

export interface ScraperConfig {
    name: string;
    url: string;
    type: SourceType;
    selectors: SelectorConfig;
    useDynamicLoading?: boolean;
    waitAfterLoad?: number;
    maxPages?: number;
    headers?: Record<string, string>;
    rateLimitMs?: number;
}
