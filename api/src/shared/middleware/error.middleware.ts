import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../utils/api-response';
import { Logger } from '../../shared/logger';

/**
 * Middleware de gestion globale des erreurs
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log de l'erreur
  Logger.error('Erreur capturée par le gestionnaire global', err, {
    composant: 'ErrorMiddleware',
    operation: 'errorHandler',
    path: req.path,
    method: req.method,
  });

  // Erreur Zod (validation)
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    };
    res.status(422).json(response);
    return;
  }

  // Erreur applicative personnalisée
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Erreur Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    handlePrismaError(err, res);
    return;
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
    };
    res.status(401).json(response);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired',
      },
    };
    res.status(401).json(response);
    return;
  }

  // Erreur inconnue
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  };
  res.status(500).json(response);
};

/**
 * Gestion des erreurs Prisma
 */
const handlePrismaError = (err: any, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
    },
  };

  // P2002: Unique constraint violation
  if (err.code === 'P2002') {
    response.error!.code = 'CONFLICT';
    response.error!.message = `A record with this ${err.meta?.target?.[0] || 'field'} already exists`;
    res.status(409).json(response);
    return;
  }

  // P2025: Record not found
  if (err.code === 'P2025') {
    response.error!.code = 'NOT_FOUND';
    response.error!.message = 'Record not found';
    res.status(404).json(response);
    return;
  }

  // P2003: Foreign key constraint failed
  if (err.code === 'P2003') {
    response.error!.code = 'INVALID_REFERENCE';
    response.error!.message = 'Invalid reference to related record';
    res.status(400).json(response);
    return;
  }

  res.status(500).json(response);
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  };
  res.status(404).json(response);
};