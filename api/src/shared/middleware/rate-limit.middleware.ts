import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../../config/redis';
import { Logger } from '../logger';

/**
 * 🛡️ Rate Limiter par Utilisateur
 * 
 * Limite à 100 requêtes par 15 minutes par utilisateur (ou IP si non authentifié)
 */
export const userRateLimiter = rateLimit({
    store: new RedisStore({
        // @ts-ignore - redisClient peut être null au chargement mais sera init au bootstrap
        sendCommand: (...args: string[]) => {
            if (!redisClient) {
                throw new Error('Redis client not initialized');
            }
            return redisClient.sendCommand(args);
        },
        prefix: 'rl:user:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // 500 requêtes
    standardHeaders: true, // Retourne les headers RateLimit-*
    legacyHeaders: false, // Désactive les headers X-RateLimit-*
    keyGenerator: (req: Request) => {
        // Utiliser userId si injecté par auth middleware, sinon IP
        return (req as any).user?.userId || req.ip;
    },
    handler: (req: Request, res: Response) => {
        Logger.warn(`Rate limit exceeded for user ${(req as any).user?.userId || req.ip}`);
        res.status(429).json({
            success: false,
            error: {
                status: 429,
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please try again in 15 minutes.'
            }
        });
    }
});
