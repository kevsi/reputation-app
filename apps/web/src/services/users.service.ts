import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/http';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    organizationId?: string;
}

class UsersService {
    async getProfile(): Promise<ApiResponse<UserProfile>> {
        return apiClient.get<UserProfile>('/users/me');
    }

    async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
        return apiClient.patch<UserProfile>('/users/me', data);
    }
}

export const usersService = new UsersService();
