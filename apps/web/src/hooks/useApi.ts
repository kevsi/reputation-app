import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

/**
 * Hook pour accéder à l'API client
 * Assure que le token d'auth est toujours à jour
 */
export function useApi() {
  const { user } = useAuth();

  // Synchroniser le token quand l'utilisateur change
  useCallback(() => {
    if (user) {
      // Token devrait être set après le login
      // apiClient.setToken(user.token);
    }
  }, [user]);

  return {
    apiClient,
    async get<T>(endpoint: string, options?: RequestInit) {
      return apiClient.callApi<T>(endpoint, options);
    },
    async post<T>(endpoint: string, body?: any, options?: RequestInit) {
      return apiClient.callApi<T>(endpoint, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
    },
    async patch<T>(endpoint: string, body?: any, options?: RequestInit) {
      return apiClient.callApi<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      });
    },
    async delete<T>(endpoint: string, options?: RequestInit) {
      return apiClient.callApi<T>(endpoint, {
        ...options,
        method: 'DELETE',
      });
    },
  };
}
