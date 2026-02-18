/**
 * Service Sources - Frontend
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import { apiClient } from '../lib/api-client';
import type { ApiResponse } from '../types/http';

export interface Source {
  id: string;
  brandId: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  status?: string;
  scrapingFrequency?: string;
  lastScrapedAt: string | null;
  lastScrapingError: string | null;
  nextScrapingAt?: string | null;
  totalMentions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSourceDTO {
  type: string;
  name: string;
  config: Record<string, unknown>;
  scrapingFrequency?: string;
}

export interface UpdateSourceDTO {
  name?: string;
  config?: Partial<Record<string, unknown>>;
  scrapingFrequency?: string;
  status?: string;
}

class SourcesService {
  /**
   * Récupérer toutes les sources d'une brand
   */
  async getByBrandId(brandId: string): Promise<ApiResponse<Source[]>> {
    return apiClient.get<Source[]>(`/brands/${brandId}/sources`);
  }

  /**
   * Créer une nouvelle source
   */
  async create(brandId: string, data: CreateSourceDTO): Promise<Source> {
    const response = await apiClient.post<Source>(`/brands/${brandId}/sources`, data);
    return response.data!;
  }

  /**
   * Récupérer une source par ID
   */
  async getById(sourceId: string): Promise<Source> {
    const response = await apiClient.get<Source>(`/sources/${sourceId}`);
    return response.data!;
  }

  /**
   * Mettre à jour une source
   */
  async update(sourceId: string, data: UpdateSourceDTO): Promise<Source> {
    const response = await apiClient.patch<Source>(`/sources/${sourceId}`, data);
    return response.data!;
  }

  /**
   * Supprimer une source (soft delete)
   */
  async delete(sourceId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/sources/${sourceId}`);
  }

  /**
   * Mettre en pause/réactiver une source
   */
  async toggleStatus(sourceId: string, status: 'ACTIVE' | 'PAUSED'): Promise<Source> {
    const response = await apiClient.patch<Source>(`/sources/${sourceId}/status`, { status });
    return response.data!;
  }

  /**
   * Déclencher un scraping manuel immédiat
   */
  async triggerScraping(sourceId: string): Promise<ApiResponse<{ jobId: string }>> {
    return apiClient.post<{ jobId: string }>(`/sources/${sourceId}/scrape`);
  }
}

export const sourcesService = new SourcesService();
