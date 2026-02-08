import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/http';

export interface Action {
    id: string;
    title: string;
    platform: string;
    priority: "Urgent" | "Priorité haute" | "Moyenne" | "Faible";
    assignedTo?: string;
    dueDate: string;
    status: "pending" | "in-progress" | "completed";
    description?: string;
}

class ActionsService {
    async getAll(brandId: string): Promise<ApiResponse<Action[]>> {
        return apiClient.get<Action[]>('/actions', { brandId });
    }

    async updateStatus(id: string, status: Action['status']): Promise<ApiResponse<Action>> {
        return apiClient.patch<Action>(`/actions/${id}`, { status });
    }

    async update(id: string, data: Partial<Action>): Promise<ApiResponse<Action>> {
        return apiClient.patch<Action>(`/actions/${id}`, data);
    }

    async create(data: Partial<Action>): Promise<ApiResponse<Action>> {
        return apiClient.post<Action>('/actions', data);
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/actions/${id}`);
    }
}

export const actionsService = new ActionsService();
