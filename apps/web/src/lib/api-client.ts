/**
 * 🌐 API Client pour Sentinelle-Reputation (Client App)
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

    async me() {
        return this.request<any>('/auth/me');
    }

    async logout() {
        this.setToken(null);
    }

    // ========================================
    // BRANDS
    // ========================================

    async getBrands() {
        return this.request<any[]>('/brands');
    }

    async createBrand(data: any) {
        return this.request<any>('/brands', {
            method: 'POST',
            body: JSON.stringify(data),
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
        return this.request<any[]>(`/mentions${query}`);
    }

    // ========================================
    // KEYWORDS
    // ========================================

    async createKeyword(data: any) {
        return this.request<any>('/keywords', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ========================================
    // SOURCES
    // ========================================

    async getSources() {
        return this.request<any[]>('/sources');
    }

    async createSource(data: any) {
        return this.request<any>('/sources', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async scrapeSourceNow(sourceId: string) {
        return this.request<any>(`/sources/${sourceId}/scrape-now`, {
            method: 'POST'
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

    // ========================================
    // ALERTS
    // ========================================

    async getAlerts(params?: { organizationId?: string; brandId?: string }) {
        const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.request<any[]>(`/alerts${query}`);
    }

    // ========================================
    // REPORTS
    // ========================================

    async getReports(params?: { organizationId?: string; brandId?: string }) {
        const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.request<any[]>(`/reports${query}`);
    }

    /**
     * Public access to request
     */
    async callApi<T>(endpoint: string, options: RequestInit = {}) {
        return this.request<T>(endpoint, options);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
