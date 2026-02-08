import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/http';
import { AlertDetail } from '../types/api';

class AlertsService {
    async getAll(brandId: string): Promise<ApiResponse<AlertDetail[]>> {
        return apiClient.get<AlertDetail[]>('/alerts', { brandId });
    }

    async getById(id: string): Promise<ApiResponse<AlertDetail>> {
        return apiClient.get<AlertDetail>(`/alerts/${id}`);
    }

    async update(id: string, data: Partial<AlertDetail>): Promise<ApiResponse<AlertDetail>> {
        return apiClient.patch<AlertDetail>(`/alerts/${id}`, data);
    }

    async resolve(id: string): Promise<ApiResponse<AlertDetail>> {
        return apiClient.patch<AlertDetail>(`/alerts/${id}/resolve`, {});
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`/alerts/${id}`);
    }
}

export const alertsService = new AlertsService();
