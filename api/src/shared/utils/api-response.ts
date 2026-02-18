import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiResponseHandler {
  /**
   * Réponse de succès
   */
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message: message || 'Success',
      data,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Réponse de succès avec pagination
   */
  static successWithPagination<T>(
    res: Response,
    data: T,
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message: message || 'Success',
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Réponse de création
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message || 'Resource created successfully', 201);
  }

  /**
   * Réponse sans contenu
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Erreur bad request (400)
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message,
        details,
      },
    };
    return res.status(400).json(response);
  }

  /**
   * Erreur unauthorized (401)
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
    };
    return res.status(401).json(response);
  }

  /**
   * Erreur forbidden (403)
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden'
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
      },
    };
    return res.status(403).json(response);
  }

  /**
   * Erreur not found (404)
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message,
      },
    };
    return res.status(404).json(response);
  }

  /**
   * Erreur conflict (409)
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict',
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        details,
      },
    };
    return res.status(409).json(response);
  }

  /**
   * Erreur validation (422)
   */
  static validationError(
    res: Response,
    errors: any,
    message: string = 'Validation failed'
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: errors,
      },
    };
    return res.status(422).json(response);
  }

  /**
   * Erreur serveur (500)
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error',
    error?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
    };
    return res.status(500).json(response);
  }
}

// Export des méthodes comme fonctions standalone pour faciliter l'usage
export const {
  success,
  successWithPagination,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  internalError,
} = ApiResponseHandler;