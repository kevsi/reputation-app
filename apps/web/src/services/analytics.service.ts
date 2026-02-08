import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/http';

export interface SentimentBreakdown {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
}

export interface AnalyticsSummary {
    totalMentions: number;
    sentimentScore: number;
    mentionTrend: number;
    sentimentTrend: number;
}

class AnalyticsService {
    async getSentimentBreakdown(brandId: string, startDate?: string, endDate?: string): Promise<ApiResponse<SentimentBreakdown>> {
        return apiClient.get<SentimentBreakdown>('/analytics/sentiment-breakdown', { brandId, startDate, endDate });
    }

    async getSummary(brandId: string, startDate?: string, endDate?: string): Promise<ApiResponse<AnalyticsSummary>> {
        return apiClient.get<AnalyticsSummary>('/analytics/summary', { brandId, startDate, endDate });
    }

    async getTrendingKeywords(brandId: string, limit: number = 10): Promise<ApiResponse<Array<{ keyword: string; count: number }>>> {
        return apiClient.get('/analytics/trending-keywords', { brandId, limit });
    }

    async getTimeline(brandId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
        return apiClient.get('/analytics/timeline', { brandId, startDate, endDate });
    }
}

export const analyticsService = new AnalyticsService();
