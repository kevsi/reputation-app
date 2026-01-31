"use strict";
/**
 * 🌐 API Client pour Sentinelle-Reputation
 *
 * Client HTTP pour communiquer avec l'API backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
class ApiClient {
    baseUrl;
    token = null;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        // Récupérer le token du localStorage au démarrage
        this.token = localStorage.getItem('auth_token');
    }
    /**
     * Définir le token d'authentification
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        }
        else {
            localStorage.removeItem('auth_token');
        }
    }
    /**
     * Récupérer le token actuel
     */
    getToken() {
        return this.token;
    }
    /**
     * Requête HTTP générique
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
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
        }
        catch (error) {
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
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }
    async register(data) {
        return this.request('/auth/register', {
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
        return this.request('/users');
    }
    async getUserById(id) {
        return this.request(`/users/${id}`);
    }
    async createUser(data) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateUser(id, data) {
        return this.request(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }
    // ========================================
    // ORGANIZATIONS
    // ========================================
    async getOrganizations() {
        return this.request('/organizations');
    }
    async getOrganizationById(id) {
        return this.request(`/organizations/${id}`);
    }
    async createOrganization(data) {
        return this.request('/organizations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateOrganization(id, data) {
        return this.request(`/organizations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deleteOrganization(id) {
        return this.request(`/organizations/${id}`, {
            method: 'DELETE',
        });
    }
    // ========================================
    // BRANDS
    // ========================================
    async getBrands() {
        return this.request('/brands');
    }
    async getBrandById(id) {
        return this.request(`/brands/${id}`);
    }
    async createBrand(data) {
        return this.request('/brands', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateBrand(id, data) {
        return this.request(`/brands/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deleteBrand(id) {
        return this.request(`/brands/${id}`, {
            method: 'DELETE',
        });
    }
    // ========================================
    // SOURCES
    // ========================================
    async getSources(brandId) {
        const query = brandId ? `?brandId=${brandId}` : '';
        return this.request(`/sources${query}`);
    }
    async getSourceById(id) {
        return this.request(`/sources/${id}`);
    }
    async createSource(data) {
        return this.request('/sources', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateSource(id, data) {
        return this.request(`/sources/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deleteSource(id) {
        return this.request(`/sources/${id}`, {
            method: 'DELETE',
        });
    }
    // ========================================
    // MENTIONS
    // ========================================
    async getMentions(params) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/mentions${query}`);
    }
    async getMentionById(id) {
        return this.request(`/mentions/${id}`);
    }
    // ========================================
    // ALERTS
    // ========================================
    async getAlerts(params) {
        const queryParams = new URLSearchParams();
        if (params?.brandId)
            queryParams.append('brandId', params.brandId);
        if (params?.organizationId)
            queryParams.append('organizationId', params.organizationId);
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return this.request(`/alerts${queryString}`);
    }
    async getAlertById(id) {
        return this.request(`/alerts/${id}`);
    }
    async createAlert(data) {
        return this.request('/alerts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateAlert(id, data) {
        return this.request(`/alerts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deleteAlert(id) {
        return this.request(`/alerts/${id}`, {
            method: 'DELETE',
        });
    }
    // ========================================
    // KEYWORDS
    // ========================================
    async getKeywords(brandId) {
        const query = brandId ? `?brandId=${brandId}` : '';
        return this.request(`/keywords${query}`);
    }
    async createKeyword(data) {
        return this.request('/keywords', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async deleteKeyword(id) {
        return this.request(`/keywords/${id}`, {
            method: 'DELETE',
        });
    }
    // ========================================
    // ANALYTICS
    // ========================================
    async getAnalyticsSummary(params) {
        const query = params ? ('?' + new URLSearchParams(params).toString()) : '';
        return this.request(`/analytics/summary${query}`);
    }
    async getSentimentBreakdown(params) {
        const query = params ? ('?' + new URLSearchParams(params).toString()) : '';
        return this.request(`/analytics/sentiment-breakdown${query}`);
    }
    async getTimeSeries(params) {
        const query = params ? ('?' + new URLSearchParams(params).toString()) : '';
        return this.request(`/analytics/time-series${query}`);
    }
    // ========================================
    // REPORTS
    // ========================================
    async getReports(brandId) {
        const query = brandId ? `?brandId=${brandId}` : '';
        return this.request(`/reports${query}`);
    }
    async generateReport(data) {
        return this.request('/reports', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // ========================================
    // ACTIONS
    // ========================================
    async getActions(organizationId) {
        const query = organizationId ? `?organizationId=${organizationId}` : '';
        return this.request(`/actions${query}`);
    }
    async createAction(data) {
        return this.request('/actions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateAction(actionId, data) {
        return this.request(`/actions/${actionId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deleteAction(actionId) {
        return this.request(`/actions/${actionId}`, {
            method: 'DELETE',
        });
    }
    // ========================================
    // SYSTEM
    // ========================================
    async getSystemStatus() {
        return this.request('/system/status');
    }
}
// Export une instance unique
exports.apiClient = new ApiClient(API_BASE_URL);
exports.default = exports.apiClient;
