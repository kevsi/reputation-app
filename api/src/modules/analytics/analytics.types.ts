export interface AnalyticsMetric {
    id: string;
    metric: 'mention_count' | 'sentiment_score' | 'reach' | 'engagement';
    value: number;
    period: 'daily' | 'weekly' | 'monthly';
    timestamp: Date;
    organizationId: string;
}

export interface AnalyticsSummary {
    totalMentions: number;
    averageSentiment: number;
    totalReach: number;
    totalEngagement: number;
    comparison?: {
        mentionCountChange: number; // percentage
        sentimentChange: number;
    };
}

export interface SentimentBreakdown {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
}

export interface TimeSeriesData {
    timestamp: Date;
    count: number;
    sentiment?: number;
}

export interface GetAnalyticsInput {
    organizationId: string;
    brandId?: string;
    period?: 'daily' | 'weekly' | 'monthly';
    startDate?: Date;
    endDate?: Date;
}
