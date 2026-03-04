/**
 * 🌐 API Client pour Sentinelle-Reputation (Client App)
 * 
 * Client HTTP typé pour communiquer avec l'API backend
 * Garantit la cohérence des types et la gestion d'erreurs
 */

import { ApiResponse, isApiError, ApiErrorCode, TypedApiError } from '@/types/http';
import { DEFAULT_RETRY_CONFIG, RetryConfig, ApiErrorHandler, logger } from './api-error-handler';
import type { Brand, Mention, Keyword, Source, User } from '@/types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

/**
 * Stratégie d'authentification
 * - 'cookie': utilise les cookies SameSite (recommandé pour cross-origin)
 * - 'bearer': utilise le header Authorization (pour same-origin)
 */
type AuthStrategy = 'cookie' | 'bearer';
const AUTH_STRATEGY: AuthStrategy = 'bearer';

// For local development, include credentials to allow cookies/auth headers
const INCLUDE_CREDENTIALS = true;

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;
    private cache = new Map<string, { data: unknown; timestamp: number }>();
    private cacheDuration = 5 * 60 * 1000; // 5 minutes
    private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        // Récupérer le token du localStorage au démarrage
        this.token = localStorage.getItem('auth_token');
    }

    /**
     * Définir le token d'authentification
     */
    setToken(token: string | null): void {
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
     * Invalider le cache
     */
    clearCache(pattern?: string): void {
        if (!pattern) {
            this.cache.clear();
        } else {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        }
    }

    /**
     * Génère une clé de cache qui inclut les query params
     */
    private buildCacheKey(method: string, endpoint: string, params?: Record<string, unknown>): string {
        let cacheKey = `${method || 'GET'}:${endpoint}`;
        
        if (params && Object.keys(params).length > 0) {
            const sortedParams = Object.entries(params)
                .filter(([, v]) => v !== undefined)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `${k}=${String(v)}`)
                .join('&');
            cacheKey += `?${sortedParams}`;
        }
        
        return cacheKey;
    }

    /**
     * Requête HTTP générique avec retry logic et timeout
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        attemptNumber = 0,
        params?: Record<string, unknown>
    ): Promise<ApiResponse<T>> {
        // Construire l'URL avec les params
        let url = `${this.baseUrl}${endpoint}`;
        if (params && Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(
                Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
            ).toString();
            url += `?${queryString}`;
        }

        const cacheKey = this.buildCacheKey(options.method || 'GET', endpoint, params);

        // Pour les GET, vérifier le cache d'abord
        if (!options.method || options.method === 'GET') {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
                logger.debug(`Cache hit for ${cacheKey}`);
                return cached.data as ApiResponse<T>;
            }
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        // Ajouter le token selon la stratégie d'authentification
        if (AUTH_STRATEGY === 'bearer' && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Credentials策略：根据认证方式决定
        // - bearer: 不需要 cookies
        // - cookie: 需要 credentials: 'include'
        const fetchOptions: RequestInit = {
            ...options,
            headers,
            signal: undefined, // 添加signal但稍后设置
        };

        // Only include credentials in cookie mode
        if (AUTH_STRATEGY === 'cookie' || INCLUDE_CREDENTIALS) {
            fetchOptions.credentials = 'include';
        }

        try {
            logger.debug(`API Request: ${options.method || 'GET'} ${endpoint}`);

            // Wrapper pour timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                this.retryConfig.timeoutMs
            );

            fetchOptions.signal = controller.signal;

            const response = await fetch(url, fetchOptions);

            clearTimeout(timeoutId);

            // Toujours parser JSON
            let data: unknown;
            try {
                data = await response.json();
            } catch {
                // Si la réponse n'est pas du JSON, créer une réponse standard
                data = {
                    success: response.ok,
                    error: {
                        code: 'INVALID_RESPONSE',
                        message: 'API returned non-JSON response'
                    }
                };
            }

            // Vérifier si la réponse est un succès
            if (!response.ok) {
                // Gestion du Refresh Token si 401
                // TODO: Implémenter le refresh token quand le backend le support
                if (response.status === 401 && this.token) {
                    logger.warn('Received 401, but refresh token is not implemented');
                    // Pour l'instant, on déconnecte l'utilisateur
                    this.setToken(null);
                }

                const shouldRetry = ApiErrorHandler.isRetryable(response.status) &&
                    attemptNumber < this.retryConfig.maxRetries;

                if (shouldRetry) {
                    // If server provided a Retry-After header, honor it
                    let delay = ApiErrorHandler.calculateBackoffDelay(attemptNumber, this.retryConfig);
                    try {
                        const retryAfter = response.headers.get('Retry-After');
                        if (retryAfter) {
                            const seconds = parseInt(retryAfter, 10);
                            if (!isNaN(seconds)) {
                                delay = Math.max(delay, seconds * 1000);
                            } else {
                                // Try to parse HTTP-date
                                const date = new Date(retryAfter);
                                if (!isNaN(date.getTime())) {
                                    const diff = date.getTime() - Date.now();
                                    if (diff > 0) delay = Math.max(delay, diff);
                                }
                            }
                        }
                    } catch (e) {
                        // ignore parsing errors and fall back to exponential backoff
                    }

                    logger.warn(`Request failed with ${response.status}, retrying in ${delay}ms (attempt ${attemptNumber + 1}/${this.retryConfig.maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.request<T>(endpoint, options, attemptNumber + 1, params);
                }

                // Erreur finale
                const errorData = ApiErrorHandler.parseErrorResponse(data, response.status);
                throw new TypedApiError(
                    errorData.code as ApiErrorCode,
                    errorData.message,
                    response.status,
                    errorData.details
                );
            }

            // Cache les réponses GET réussies
            if (!options.method || options.method === 'GET') {
                this.cache.set(cacheKey, { data, timestamp: Date.now() });
            }

            logger.debug(`API Response success: ${endpoint}`, data);
            return data as ApiResponse<T>;

        } catch (error: unknown) {
            logger.error(`API Request failed: ${endpoint}`, error);

            // Gestion des erreurs TypedApiError
            if (error instanceof TypedApiError) {
                return {
                    success: false,
                    error: error.toApiError()
                };
            }

            // Gestion des erreurs AbortController (timeout)
            if (error instanceof DOMException && error.name === 'AbortError') {
                return {
                    success: false,
                    error: {
                        code: ApiErrorCode.TIMEOUT,
                        message: 'Request timeout',
                        statusCode: 0
                    }
                };
            }

            // Gestion des erreurs réseau
            if (error instanceof Error) {
                return {
                    success: false,
                    error: {
                        code: ApiErrorCode.NETWORK_ERROR,
                        message: error.message || 'Network request failed',
                        statusCode: 0
                    }
                };
            }

            // Erreur inconnue
            return {
                success: false,
                error: {
                    code: ApiErrorCode.UNKNOWN_ERROR,
                    message: 'An unknown error occurred',
                    statusCode: 0
                }
            };
        }
    }

    // ========================================
    // AUTH
    // ========================================

    async login(email: string, password: string): Promise<ApiResponse<{
        accessToken: string;
        refreshToken?: string;
        user: User;
    }>> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(data: {
        email: string;
        password: string;
        name: string;
        organizationName: string;
    }): Promise<ApiResponse<{
        accessToken: string;
        refreshToken?: string;
        user: User;
    }>> {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async me(): Promise<ApiResponse<User>> {
        return this.request<User>('/auth/me');
    }

    async logout(): Promise<void> {
        this.setToken(null);
        this.clearCache(); // Clear all cached data on logout
    }

    /**
     * Login with Google - sends the Google ID token to the backend
     */
    async loginWithGoogle(idToken: string): Promise<ApiResponse<{
        accessToken: string;
        refreshToken?: string;
        user: User;
    }>> {
        return this.request('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        });
    }

    // ========================================
    // BRANDS
    // ========================================

    async getBrands(): Promise<ApiResponse<Brand[]>> {
        return this.request<Brand[]>('/brands');
    }

    async createBrand(data: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Brand>> {
        const result = await this.request<Brand>('/brands', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.clearCache('brands'); // Invalidate brands cache
        return result;
    }

    async updateBrand(id: string, data: Partial<Brand>): Promise<ApiResponse<Brand>> {
        const result = await this.request<Brand>(`/brands/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        this.clearCache('brands');
        return result;
    }

    async deleteBrand(id: string): Promise<ApiResponse<void>> {
        const result = await this.request<void>(`/brands/${id}`, {
            method: 'DELETE',
        });
        this.clearCache('brands'); // Invalidate brands cache
        return result;
    }

    // ========================================
    // MENTIONS
    // ========================================

    async getMentions(params?: Record<string, unknown>): Promise<ApiResponse<Mention[]>> {
        return this.request<Mention[]>('/mentions', {}, 0, params);
    }

    // ========================================
    // KEYWORDS
    // ========================================

    async getKeywords(brandId: string): Promise<ApiResponse<Keyword[]>> {
        return this.request<Keyword[]>(`/keywords?brandId=${encodeURIComponent(brandId)}`);
    }

    async createKeyword(data: { brandId: string; keyword: string }): Promise<ApiResponse<Keyword>> {
        return this.request<Keyword>('/keywords', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteKeyword(data: { brandId: string; keyword: string }): Promise<ApiResponse<void>> {
        return this.request<void>('/keywords', {
            method: 'DELETE',
            body: JSON.stringify(data),
        });
    }

    // ========================================
    // SOURCES
    // ========================================

    async getSources(): Promise<ApiResponse<Source[]>> {
        return this.request<Source[]>('/sources');
    }

    async createSource(data: Omit<Source, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Source>> {
        return this.request<Source>('/sources', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async scrapeSourceNow(sourceId: string): Promise<ApiResponse<{ success: boolean }>> {
        return this.request<{ success: boolean }>(`/sources/${encodeURIComponent(sourceId)}/scrape-now`, {
            method: 'POST'
        });
    }

    // ========================================
    // ANALYTICS
    // ========================================

    async getAnalyticsSummary(params?: Record<string, unknown>): Promise<ApiResponse<unknown>> {
        return this.request<unknown>('/analytics/summary', {}, 0, params);
    }

    // ========================================
    // ALERTS
    // ========================================

    async getAlerts(params?: Record<string, unknown>): Promise<ApiResponse<unknown[]>> {
        return this.request<unknown[]>('/alerts', {}, 0, params);
    }

    // ========================================
    // REPORTS
    // ========================================

    async getReports(params?: Record<string, unknown>): Promise<ApiResponse<unknown[]>> {
        return this.request<unknown[]>('/reports', {}, 0, params);
    }

    // ========================================
    // GENERIC HTTP METHODS
    // ========================================

    /**
     * Generic GET request with params support
     */
    async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {}, 0, params);
    }

    /**
     * Unwrap an ApiResponse<T> into T or throw a TypedApiError
     */
    private unwrapResponse<T>(res: ApiResponse<T>): T {
        if (isApiError(res)) {
            throw new TypedApiError(
                res.error!.code as ApiErrorCode,
                res.error!.message,
                res.error!.statusCode || 500,
                res.error!.details
            );
        }
        return (res.data === undefined ? undefined : res.data) as T;
    }

    /** Convenience GET + unwrap helper */
    async getData<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
        const res = await this.get<T>(endpoint, params);
        return this.unwrapResponse(res);
    }

    async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }

    /**
     * Accès public à request pour les cas d'usage avancés
     * @deprecated Préférez utiliser les méthodes génériques get/post/put/patch/delete
     */
    async callApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, options);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
