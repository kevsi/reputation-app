/**
 * Service de gestion des erreurs API avec retry logic
 */

import { ApiError, ApiErrorCode } from '@/types/http';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeoutMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  timeoutMs: 30000
};

export class ApiErrorHandler {
  /**
   * Mappe les status HTTP vers les codes d'erreur standardisés
   */
  static mapStatusToErrorCode(status: number): ApiErrorCode {
    if (status === 401) return ApiErrorCode.UNAUTHORIZED;
    if (status === 403) return ApiErrorCode.FORBIDDEN;
    if (status === 404) return ApiErrorCode.NOT_FOUND;
    if (status === 409) return ApiErrorCode.CONFLICT;
    if (status === 422) return ApiErrorCode.VALIDATION_ERROR;
    if (status === 429) return ApiErrorCode.RATE_LIMIT;
    if (status >= 500) return ApiErrorCode.INTERNAL_ERROR;
    if (status >= 400) return ApiErrorCode.VALIDATION_ERROR;
    return ApiErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Détermine si une erreur peut être retry
   */
  static isRetryable(status: number): boolean {
    // Retry on 5xx and timeouts only
    // Do NOT retry on 429 (rate limit) - backing off won't help
    // Do NOT retry on 4xx client errors
    return status >= 500 || status === 0; // 0 = timeout/network
  }

  /**
   * Calcule le délai exponential backoff
   */
  static calculateBackoffDelay(
    attempt: number,
    config: RetryConfig
  ): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    // Ajouter jitter pour éviter thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return Math.min(delay + jitter, config.maxDelay);
  }

  /**
   * Parse une réponse d'erreur
   */
  static parseErrorResponse(error: unknown, status: number): ApiError {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const errorObj = error as any;
      if (typeof errorObj.error === 'object' && errorObj.error !== null) {
        return {
          code: errorObj.error.code || this.mapStatusToErrorCode(status),
          message: errorObj.error.message || 'Une erreur est survenue',
          details: errorObj.error.details,
          statusCode: status
        };
      }
    }

    return {
      code: this.mapStatusToErrorCode(status),
      message: 'Une erreur est survenue lors de la requête',
      statusCode: status
    };
  }

  /**
   * Crée un message d'erreur user-friendly
   */
  static getUserMessage(error: ApiError): string {
    switch (error.code) {
      case ApiErrorCode.NETWORK_ERROR:
        return 'Erreur réseau. Vérifiez votre connexion Internet.';
      case ApiErrorCode.TIMEOUT:
        return 'La requête a expiré. Veuillez réessayer.';
      case ApiErrorCode.UNAUTHORIZED:
        return 'Vous n\'êtes pas authentifié. Veuillez vous connecter.';
      case ApiErrorCode.FORBIDDEN:
        return 'Vous n\'avez pas les permissions pour cette action.';
      case ApiErrorCode.NOT_FOUND:
        return 'La ressource demandée n\'a pas été trouvée.';
      case ApiErrorCode.VALIDATION_ERROR:
        return 'Les données envoyées sont invalides.';
      case ApiErrorCode.CONFLICT:
        return 'Cette ressource existe déjà.';
      case ApiErrorCode.RATE_LIMIT:
        return 'Trop de requêtes. Veuillez attendre quelques instants.';
      case ApiErrorCode.SERVICE_UNAVAILABLE:
        return 'Le service est temporairement indisponible. Veuillez réessayer.';
      case ApiErrorCode.INTERNAL_ERROR:
        return 'Une erreur serveur s\'est produite. Veuillez réessayer.';
      default:
        return error.message || 'Une erreur inconnue s\'est produite.';
    }
  }
}

/**
 * Logger centralisé
 */
export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
};
