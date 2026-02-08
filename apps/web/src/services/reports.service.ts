import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/http';
import { Report, ScheduledReport } from '../types/api';

class ReportsService {
    async getAll(brandId: string): Promise<ApiResponse<Report[]>> {
        return apiClient.get<Report[]>('/reports', { brandId });
    }

    async generate(data: { brandId: string; type: string; format: string; startDate: string; endDate: string }): Promise<ApiResponse<Report>> {
        return apiClient.post<Report>('/reports/generate', data);
    }

    async getScheduled(brandId: string): Promise<ApiResponse<ScheduledReport[]>> {
        return apiClient.get<ScheduledReport[]>('/reports/scheduled', { brandId });
    }

    async toggleScheduled(id: string, isActive: boolean): Promise<ApiResponse<ScheduledReport>> {
        return apiClient.patch<ScheduledReport>(`/reports/scheduled/${id}`, { isActive });
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`/reports/${id}`);
    }
}

export const reportsService = new ReportsService();
