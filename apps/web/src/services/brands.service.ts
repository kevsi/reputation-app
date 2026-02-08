import { apiClient } from '../lib/api-client';
import { BrandDetail } from '../types/api';
import { ApiResponse } from '../types/http';

class BrandsService {
    async getAll(): Promise<ApiResponse<BrandDetail[]>> {
        return apiClient.get<BrandDetail[]>('/brands');
    }

    async getById(id: string): Promise<ApiResponse<BrandDetail>> {
        return apiClient.get<BrandDetail>(`/brands/${id}`);
    }

    async create(data: Partial<BrandDetail>): Promise<ApiResponse<BrandDetail>> {
        const res = await apiClient.post<BrandDetail>('/brands', data);
        apiClient.clearCache('brands');
        return res;
    }

    async update(id: string, data: Partial<BrandDetail>): Promise<ApiResponse<BrandDetail>> {
        const res = await apiClient.put<BrandDetail>(`/brands/${id}`, data);
        apiClient.clearCache('brands');
        return res;
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        const res = await apiClient.delete<void>(`/brands/${id}`);
        apiClient.clearCache('brands');
        return res;
    }
}

export const brandsService = new BrandsService();
