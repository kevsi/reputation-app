import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/http';
import { DashboardStats } from '../types/api';

class DashboardService {
    async getStats(brandId: string): Promise<ApiResponse<DashboardStats>> {
        return apiClient.get<DashboardStats>('/dashboard/stats', { brandId });
    }

    async getRecentActivity(brandId: string): Promise<ApiResponse<any[]>> {
        return apiClient.get('/dashboard/activity', { brandId });
    }
}

export const dashboardService = new DashboardService();
