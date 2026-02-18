/**
 * Classe de base pour les erreurs applicatives
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintient la stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreur de validation
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, 'VALIDATION_ERROR', true, details);
  }
}

/**
 * Erreur d'authentification
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

/**
 * Erreur de permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN', true);
  }
}

/**
 * Ressource non trouvée
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', true);
  }
}

/**
 * Conflit (ex: email déjà utilisé)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, 'CONFLICT', true, details);
  }
}

/**
 * Limite de plan dépassée
 */
export class PlanLimitError extends AppError {
  constructor(feature: string, limit: number) {
    super(
      `Plan limit exceeded for ${feature}. Maximum allowed: ${limit}`,
      403,
      'PLAN_LIMIT_EXCEEDED',
      true,
      { feature, limit }
    );
  }
}

/**
 * Erreur de service externe
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(
      `External service error (${service}): ${message}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      true
    );
  }
}

/**
 * Rate limit dépassé
 */
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'Too many requests, please try again later',
      429,
      'RATE_LIMIT_EXCEEDED',
      true,
      { retryAfter }
    );
  }
}