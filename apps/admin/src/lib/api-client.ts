/**
 * 🌐 API Client pour Sentinelle-Reputation
 * 
 * Client HTTP pour communiquer avec l'API backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: any;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        // Récupérer le token du localStorage au démarrage
        this.token = localStorage.getItem('auth_token');
    }

    /**
     * Définir le token d'authentification
     */
    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    /**
     * Récupérer le token actuel
     */
    getToken(): string | null {
        return this.token;
    }

    /**
     * Requête HTTP générique
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Ajouter le token si disponible
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();
            console.log('📡 API Response:', { url, status: response.status, ok: response.ok, data });

            if (!response.ok) {
                console.error('❌ API Error Response:', { status: response.status, data });
                throw {
                    status: response.status,
                    ...data,
                };
            }

            return data;
        } catch (error: any) {
            console.error('💥 API Error:', error);
            // If it's already our formatted error, just re-throw it
            if (error.status) {
                throw error;
            }
            // Otherwise, wrap it in a generic error
            throw {
                status: 500,
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: error.message || 'Network request failed'
                }
            };
        }
    }

    // ========================================
    // AUTH
    // ========================================

    async login(email: string, password: string) {
        return this.request<{
            accessToken: string;
            refreshToken: string;
            user: any;
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(data: {
        email: string;
        password: string;
        name: string;
        organizationName: string;
    }) {
        return this.request<{
            accessToken: string;
            refreshToken: string;
            user: any;
        }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async logout() {
        this.setToken(null);
    }

    // ========================================
    // USERS
    // ========================================

    async getUsers() {
        return this.request<any[]>('/users');
    }

    async getUserById(id: string) {
        return this.request<any>(`/users/${id}`);
    }

    async createUser(data: any) {
        return this.request<any>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateUser(id: string, data: any) {
        return this.request<any>(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteUser(id: string) {
        return this.request<void>(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    // ========================================
    // ORGANIZATIONS
    // ========================================

    async getOrganizations() {
        return this.request<any[]>('/organizations');
    }

    async getOrganizationById(id: string) {
        return this.request<any>(`/organizations/${id}`);
    }

    async createOrganization(data: any) {
        return this.request<any>('/organizations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateOrganization(id: string, data: any) {
        return this.request<any>(`/organizations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteOrganization(id: string) {
        return this.request<void>(`/organizations/${id}`, {
            method: 'DELETE',
        });
    }

    // ========================================
    // BRANDS
    // ========================================

    async getBrands() {
        return this.request<any[]>('/brands');
    }

    async getBrandById(id: string) {
        return this.request<any>(`/brands/${id}`);
    }

    async createBrand(data: any) {
        return this.request<any>('/brands', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateBrand(id: string, data: any) {
        return this.request<any>(`/brands/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteBrand(id: string) {
        return this.request<void>(`/brands/${id}`, {
            method: 'DELETE',
        });
    }

    // ========================================
    // SOURCES
    // ========================================

    async getSources(brandId?: string) {
        const query = brandId ? `?brandId=${brandId}` : '';
        return this.request<any[]>(`/sources${query}`);
    }

    async getSourceById(id: string) {
        return this.request<any>(`/sources/${id}`);
    }

    async createSource(data: any) {
        return this.request<any>('/sources', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateSource(id: string, data: any) {
        return this.request<any>(`/sources/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteSource(id: string) {
        return this.request<void>(`/sources/${id}`, {
            method: 'DELETE',
        });
    }

    // ========================================
    // MENTIONS
    // ========================================

    async getMentions(params?: {
        brandId?: string;
        sourceId?: string;
        sentiment?: string;
        limit?: number;
        offset?: number;
    }) {
        const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
        // Use /filtered endpoint when brandId is provided for filtering
        const endpoint = params?.brandId ? `/mentions/filtered${query}` : `/mentions${query}`;
        return this.request<any[]>(endpoint);
    }

    async getMentionById(id: string) {
        return this.request<any>(`/mentions/${id}`);
    }

    // ========================================
    // ALERTS
    // ========================================

    async getAlerts(params?: { brandId?: string, organizationId?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.brandId) queryParams.append('brandId', params.brandId);
        if (params?.organizationId) queryParams.append('organizationId', params.organizationId);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return this.request<any[]>(`/alerts${queryString}`);
    }

    async getAlertById(id: string) {
        return this.request<any>(`/alerts/${id}`);
    }

    async createAlert(data: any) {
        return this.request<any>('/alerts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateAlert(id: string, data: any) {
        return this.request<any>(`/alerts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteAlert(id: string) {
        return this.request<void>(`/alerts/${id}`, {
            method: 'DELETE',
        });
    }

    // ========================================
    // KEYWORDS
    // ========================================

    async getKeywords(brandId?: string) {
        const query = brandId ? `?brandId=${brandId}` : '';
        return this.request<any[]>(`/keywords${query}`);
    }

    async createKeyword(data: any) {
        return this.request<any>('/keywords', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteKeyword(id: string) {
        return this.request<void>(`/keywords/${id}`, {
            method: 'DELETE',
        });
    }

    // ========================================
    // ANALYTICS
    // ========================================

    async getAnalyticsSummary(params?: {
        organizationId?: string; // no longer required (API uses JWT orgId)
        brandId?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const query = params ? ('?' + new URLSearchParams(params as any).toString()) : '';
        return this.request<any>(`/analytics/summary${query}`);
    }

    async getSentimentBreakdown(params?: {
        organizationId?: string; // no longer required (API uses JWT orgId)
        brandId?: string;
    }) {
        const query = params ? ('?' + new URLSearchParams(params as any).toString()) : '';
        return this.request<any>(`/analytics/sentiment-breakdown${query}`);
    }

    async getTimeSeries(params?: {
        organizationId?: string; // no longer required (API uses JWT orgId)
        brandId?: string;
        period?: 'daily' | 'weekly' | 'monthly';
        startDate?: string;
        endDate?: string;
    }) {
        const query = params ? ('?' + new URLSearchParams(params as any).toString()) : '';
        return this.request<any[]>(`/analytics/time-series${query}`);
    }

    // ========================================
    // REPORTS
    // ========================================

    async getReports(brandId?: string) {
        const query = brandId ? `?brandId=${brandId}` : '';
        return this.request<any[]>(`/reports${query}`);
    }

    async generateReport(data: any) {
        return this.request<any>('/reports', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ========================================
    // ACTIONS
    // ========================================

    async getActions(organizationId?: string) {
        const query = organizationId ? `?organizationId=${organizationId}` : '';
        return this.request<any[]>(`/actions${query}`);
    }

    async createAction(data: any) {
        return this.request<any>('/actions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateAction(actionId: string, data: any) {
        return this.request<any>(`/actions/${actionId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteAction(actionId: string) {
        return this.request<any>(`/actions/${actionId}`, {
            method: 'DELETE',
        });
    }

    // ========================================
    // SYSTEM
    // ========================================

    async getSystemStatus() {
        return this.request<any>('/system/status');
    }
}

// Export une instance unique
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
