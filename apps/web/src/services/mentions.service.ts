import { apiClient } from '../lib/api-client';
import { MentionDetail, PaginatedMentions } from '../types/api';
import { ApiResponse } from '../types/http';

export interface GetMentionsParams {
    brandId: string;
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
    page?: number;
    limit?: number;
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
}

class MentionsService {
    /**
     * Récupérer toutes les mentions avec filtres et pagination serveur
     */
    async getAll(params: GetMentionsParams): Promise<ApiResponse<PaginatedMentions>> {
        const queryParams: Record<string, any> = { ...params };

        // Nettoyer les paramètres undefined
        Object.keys(queryParams).forEach(key =>
            queryParams[key] === undefined && delete queryParams[key]
        );

        return apiClient.get<PaginatedMentions>('/mentions', queryParams);
    }

    /**
     * Récupérer une mention par son ID
     */
    async getById(id: string): Promise<ApiResponse<MentionDetail>> {
        return apiClient.get<MentionDetail>(`/mentions/${id}`);
    }

    async updateStatus(id: string, status: 'NEW' | 'TREATED' | 'IGNORED' | 'MONITORED'): Promise<ApiResponse<void>> {
        return apiClient.patch(`/mentions/${id}/status`, { status });
    }

    /**
     * Marquer une mention comme traitée
     */
    async markAsTreated(id: string): Promise<ApiResponse<void>> {
        return this.updateStatus(id, 'TREATED');
    }

    /**
     * Ignorer une mention
     */
    async ignore(id: string): Promise<ApiResponse<void>> {
        return this.updateStatus(id, 'IGNORED');
    }

    /**
     * Supprimer une mention
     */
    async delete(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/mentions/${id}`);
    }
}

export const mentionsService = new MentionsService();
