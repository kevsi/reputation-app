import { Request, Response, NextFunction } from 'express';
import { jwtService, JwtPayload } from '@/modules/auth/jwt.service';
import { tokenBlacklistService } from '@/modules/auth/token-blacklist.service';
import { AppError } from '@/shared/utils/errors';
import { Logger } from '../../shared/logger';
import { prisma } from '@/shared/database/prisma.client';
import { redisClient } from '../../config/redis';

// Constants for user caching
const USER_CACHE_TTL = 300; // 5 minutes
const USER_CACHE_PREFIX = 'user:cache:';

// Extend Request interface for user
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: JwtPayload & { cachedAt?: number };
        }
    }
}

/**
 * Get user from Redis cache or database
 */
async function getCachedUser(userId: string): Promise<{
    id: string;
    email: string;
    organizationId: string | null;
    role: string;
    isActive: boolean;
} | null> {
    if (!redisClient) {
        // Fallback to database if Redis not available
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                organizationId: true,
                role: true,
                isActive: true
            }
        });
    }

    const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
    
    try {
        // Try to get from cache
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            Logger.debug('User cache hit', { userId });
            return JSON.parse(cached);
        }
    } catch (error) {
        Logger.warn('Redis cache read error, falling back to DB', { userId, error });
    }

    // Cache miss - fetch from database
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            organizationId: true,
            role: true,
            isActive: true
        }
    });

    if (user) {
        try {
            // Cache the user
            await redisClient.setEx(cacheKey, USER_CACHE_TTL, JSON.stringify(user));
        } catch (error) {
            Logger.warn('Redis cache write error', { userId, error });
        }
    }

    return user;
}

/**
 * Invalidate user cache (call when user data changes)
 */
export async function invalidateUserCache(userId: string): Promise<void> {
    if (!redisClient) return;
    
    const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
    try {
        await redisClient.del(cacheKey);
    } catch (error) {
        Logger.warn('Failed to invalidate user cache', { userId, error });
    }
}

/**
 * 🔐 Middleware d'authentification
 * 
 * Vérifie le token JWT et attache les informations utilisateur à req.user
 * Uses Redis caching to reduce database load
 */
export const requireAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Récupérer le token depuis le cookie ou le header Authorization
        let token: string | undefined;

        // Priorité 1: Cookie
        if (req.cookies?.access_token) {
            token = req.cookies.access_token;
        }
        // Priorité 2: Header Authorization (pour compatibilité)
        else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }

        if (!token) {
            throw new AppError('No token provided', 401, 'NO_TOKEN');
        }

        // Vérifier si le token est blacklisté
        const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
        if (isBlacklisted) {
            throw new AppError('Token has been revoked', 401, 'TOKEN_REVOKED');
        }

        // Vérifier le token
        const payload = jwtService.verifyToken(token);

        // Get user from cache (or database fallback)
        const user = await getCachedUser(payload.userId);

        if (!user) {
            throw new AppError('User not found', 401, 'USER_NOT_FOUND');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED');
        }

        // Attacher les informations utilisateur à la requête
        req.user = {
            userId: user.id,
            email: user.email,
            organizationId: user.organizationId,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }

        if (error instanceof Error) {
            if (error.message === 'TOKEN_EXPIRED') {
                return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
            }
            if (error.message === 'INVALID_TOKEN') {
                return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
            }
        }

        Logger.error('Erreur dans le middleware d\'authentification', error as Error, { composant: 'AuthMiddleware', operation: 'requireAuth' });
        next(new AppError('Authentication failed', 401, 'AUTH_FAILED'));
    }
};

/**
 * 🔐 Middleware pour vérifier le rôle
 * 
 * @param roles - Rôles autorisés
 */
export const requireRole = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED'));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Insufficient permissions. Required roles: ${roles.join(', ')}`,
                    403,
                    'INSUFFICIENT_PERMISSIONS'
                )
            );
        }

        next();
    };
};

/**
 * 🔐 Middleware optionnel d'authentification
 * 
 * Attache req.user si un token valide est fourni, mais ne bloque pas si absent
 */
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = jwtService.verifyToken(token);
            req.user = payload;
        }

        next();
    } catch (error) {
        // En mode optionnel, on ignore les erreurs de token
        next();
    }
};
