import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/http';
import { KeywordDetail } from '../types/api';

class KeywordsService {
    async getAll(brandId: string): Promise<ApiResponse<KeywordDetail[]>> {
        return apiClient.get<KeywordDetail[]>('/keywords', { brandId });
    }

    async create(data: { name: string; brandId: string }): Promise<ApiResponse<KeywordDetail>> {
        return apiClient.post<KeywordDetail>('/keywords', { word: data.name, brandId: data.brandId });
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`/keywords/${id}`);
    }
}

export const keywordsService = new KeywordsService();
