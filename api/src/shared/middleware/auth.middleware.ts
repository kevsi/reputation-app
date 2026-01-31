import { Request, Response, NextFunction } from 'express';
import { jwtService, JwtPayload } from '@/modules/auth/jwt.service';
import { AppError } from '@/shared/utils/errors';
import { Logger } from '../../shared/logger';
import { prisma } from '@/shared/database/prisma.client';

// Étendre l'interface Request pour inclure user
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * 🔐 Middleware d'authentification
 * 
 * Vérifie le token JWT et attache les informations utilisateur à req.user
 */
export const requireAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Récupérer le token depuis le header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401, 'NO_TOKEN');
        }

        const token = authHeader.substring(7); // Enlever "Bearer "

        // Vérifier le token
        const payload = jwtService.verifyToken(token);

        // Récupérer l'utilisateur actuel depuis la base de données pour avoir les données à jour
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: { organization: true }
        });

        if (!user) {
            throw new AppError('User not found', 401, 'USER_NOT_FOUND');
        }

        // Attacher les informations utilisateur à la requête (avec les données à jour)
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
