/**
 * Types HTTP standardisés pour toutes les communications API
 * Garantit la cohérence entre frontend et backend
 */

/**
 * Réponse API standardisée - Format unique pour toutes les endpoints
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * Structure d'erreur standardisée
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

/**
 * Métadonnées optionnelles
 */
export interface ApiMeta {
  timestamp?: string;
  path?: string;
  [key: string]: unknown;
}

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalPages: number;
}

/**
 * Options pour les requêtes paginées
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Type guard pour vérifier si une réponse est une réponse d'erreur
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiResponse<never> & { error: ApiError } {
  return !response.success && response.error !== undefined;
}

/**
 * Type guard pour vérifier si une réponse est un succès
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

/**
 * Énumération des codes d'erreur standard
 */
export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT = 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Classe pour créer des erreurs API typées
 */
export class TypedApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TypedApiError';
    Object.setPrototypeOf(this, TypedApiError.prototype);
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode
    };
  }
}
