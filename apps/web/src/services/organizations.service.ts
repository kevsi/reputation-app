import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/http';

export interface Organization {
    id: string;
    name: string;
    plan?: string;
}

class OrganizationsService {
    async getById(id: string): Promise<ApiResponse<Organization>> {
        return apiClient.get<Organization>(`/organizations/${id}`);
    }

    async update(id: string, data: Partial<Organization>): Promise<ApiResponse<Organization>> {
        return apiClient.patch<Organization>(`/organizations/${id}`, data);
    }
}

export const organizationsService = new OrganizationsService();
