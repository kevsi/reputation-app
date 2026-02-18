/**
 * 🔄 Response Format Middleware
 * 
 * Standardise toutes les réponses API pour garantir la cohérence
 * entre le backend et le frontend
 * 
 * Problème résolu: Certaines routes retournent des formats différents
 * Solution: Ce middleware wrap toutes les réponses dans un format standard
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/infrastructure/logger';

export interface StandardApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        timestamp: string;
        path?: string;
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export const responseFormatter = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Stocker la méthode json originale
    const originalJson = res.json.bind(res);

    // Remplacer par notre version personnalisée
    res.json = (data: unknown): Response => {
        // Ne pas formatter si:
        // 1. C'est une réponse d'erreur déjà formatée (avec 'success: false')
        // 2. C'est une réponse 204 No Content
        // 3. C'est un stream ou fichier

        if (res.statusCode === 204 || data === undefined) {
            return originalJson(data);
        }

        // Si déjà formaté correctement, laisser tel quel
        // Vérifier que c'est bien notre format (success + data OU success + error)
        if (data && typeof data === 'object' && 'success' in data) {
            const hasDataOrError = ('data' in data) || ('error' in data);
            const hasMeta = 'meta' in data;
            // Si déjà formaté par notre système, ne pas re-wrapper
            if (hasDataOrError && hasMeta) {
                return originalJson(data);
            }
        }

        // Wrapper la réponse dans le format standard
        const standardResponse: StandardApiResponse = {
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: data as unknown,
            meta: {
                timestamp: new Date().toISOString(),
                path: req.path
            }
        };

        // En development, logger les réponses
        if (process.env.NODE_ENV === 'development') {
            logger.debug('Response formatted', {
                path: req.path,
                statusCode: res.statusCode,
                hasData: !!standardResponse.data
            });
        }

        return originalJson(standardResponse);
    };

    next();
};

/**
 * Helper pour créer des réponses d'erreur standardisées
 */
export const createErrorResponse = (
    code: string,
    message: string,
    details?: unknown,
): StandardApiResponse => {
    return {
        success: false,
        error: {
            code,
            message,
            details
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    };
};

/**
 * Middleware pour gérer les réponses avec pagination
 */
export const paginatedResponse = (
    res: Response,
    data: unknown,
    pagination: {
        page: number;
        limit: number;
        total: number;
    }
): Response => {
    return res.status(200).json({
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit)
        }
    } as StandardApiResponse);
};
