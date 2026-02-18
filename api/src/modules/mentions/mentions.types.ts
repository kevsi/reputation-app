
/**
 * 📋 Mentions
 * 
 * Une mention est un contenu filtré depuis une source contenant un mot-clé.
 */
export type SentimentType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';

export interface Mention {
    id: string;
    content: string;
    author?: string;
    authorUrl?: string;
    url?: string;
    sentiment: SentimentType;
    sentimentScore?: number;
    language?: string;
    publishedAt: Date;
    analyzedAt?: Date;
    brandId: string;
    sourceId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MentionsResponse {
    success: boolean;
    data: Mention[];
    count: number;
}

export interface MentionResponse {
    success: boolean;
    data: Mention;
}

export interface CreateMentionInput {
    content: string;
    author?: string;
    authorUrl?: string;
    url?: string;
    sentiment?: SentimentType;
    sentimentScore?: number;
    language?: string;
    publishedAt: Date;
    brandId: string;
    sourceId: string;
}

export interface UpdateMentionInput {
    sentiment?: SentimentType;
    sentimentScore?: number;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}
