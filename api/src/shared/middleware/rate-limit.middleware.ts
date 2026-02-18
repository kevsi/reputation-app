import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../config/redis';
import { Logger } from '../logger';

// In-memory rate limit store as fallback when Redis is unavailable
interface MemoryStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const memoryStore: MemoryStore = {};

/**
 * In-memory rate limiter fallback
 * Used when Redis is unavailable
 */
const memoryRateLimiter = (
    windowMs: number,
    limit: number,
    keyGenerator: (req: Request) => string
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const key = keyGenerator(req);
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean up old entries
        for (const k in memoryStore) {
            if (memoryStore[k].resetTime < windowStart) {
                delete memoryStore[k];
            }
        }
        
        // Check and update count - reset if window has expired
        if (!memoryStore[key] || memoryStore[key].resetTime < now) {
            memoryStore[key] = {
                count: 1,
                resetTime: now + windowMs
            };
            next();
            return;
        }
        
        if (memoryStore[key].count >= limit) {
            Logger.warn(`In-memory rate limit exceeded for ${key}`);
            res.status(429).json({
                success: false,
                error: {
                    status: 429,
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests. Please try again later.'
                }
            });
            return;
        }
        
        memoryStore[key].count++;
        next();
    };
};

// Lazy-loaded rate limiters
let _userRateLimiter: ((req: Request, res: Response, next: NextFunction) => void) | null = null;
let _authRateLimiter: ((req: Request, res: Response, next: NextFunction) => void) | null = null;
let _writeRateLimiter: ((req: Request, res: Response, next: NextFunction) => void) | null = null;
let _useMemoryFallback = false;

/**
 * Check if using in-memory fallback
 */
export const isUsingMemoryFallback = () => _useMemoryFallback;

/**
 * Initialize rate limiter dynamically
 */
const initRateLimiter = async () => {
    if (_userRateLimiter) return;
    
    try {
        // Check if Redis is available
        if (!redisClient) {
            Logger.warn('Redis not available, using in-memory rate limiting fallback');
            _useMemoryFallback = true;
            initMemoryFallbackLimiters();
            return;
        }
        
        // Test Redis connection
        await redisClient.ping();
        
        const rateLimit = (await import('express-rate-limit')).default;
        const RedisStore = (await import('rate-limit-redis')).default;
        
        // User rate limiter
        _userRateLimiter = rateLimit({
            store: new RedisStore({
                sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
                prefix: 'rl:user:'
            }),
            windowMs: 15 * 60 * 1000,
            limit: 1000,
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: (req: Request) => {
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
        }) as any;
        
        // Auth rate limiter
        _authRateLimiter = rateLimit({
            store: new RedisStore({
                sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
                prefix: 'rl:auth:'
            }),
            windowMs: 15 * 60 * 1000,
            limit: 5,
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: (req: Request) => {
                const email = req.body?.email || 'unknown';
                return `${req.ip}:${email}`;
            },
            handler: (req: Request, res: Response) => {
                const email = req.body?.email || 'unknown';
                Logger.warn(`Auth rate limit exceeded for ${email} from IP ${req.ip}`);
                res.status(429).json({
                    success: false,
                    error: {
                        status: 429,
                        code: 'AUTH_RATE_LIMIT_EXCEEDED',
                        message: 'Too many authentication attempts. Please try again in 15 minutes.'
                    }
                });
            }
        }) as any;
        
        // Write rate limiter
        _writeRateLimiter = rateLimit({
            store: new RedisStore({
                sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
                prefix: 'rl:write:'
            }),
            windowMs: 60 * 1000,
            limit: 100,
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: (req: Request) => {
                return (req as any).user?.userId || req.ip;
            },
            handler: (req: Request, res: Response) => {
                Logger.warn(`Write rate limit exceeded for user ${(req as any).user?.userId || req.ip}`);
                res.status(429).json({
                    success: false,
                    error: {
                        status: 429,
                        code: 'WRITE_RATE_LIMIT_EXCEEDED',
                        message: 'Too many write requests. Please slow down.'
                    }
                });
            }
        }) as any;
        
        Logger.info('✅ Rate limiters initialized with Redis');
    } catch (error) {
        Logger.error('Failed to initialize rate limiters, using in-memory fallback', error as Error);
        _useMemoryFallback = true;
        initMemoryFallbackLimiters();
    }
};

/**
 * Initialize in-memory fallback rate limiters (when Redis unavailable)
 */
const initMemoryFallbackLimiters = () => {
    _userRateLimiter = memoryRateLimiter(15 * 60 * 1000, 1000, (req) => 
        (req as any).user?.userId || req.ip
    );
    
    _authRateLimiter = memoryRateLimiter(15 * 60 * 1000, 5, (req) => {
        const email = (req as any).body?.email || 'unknown';
        return `${req.ip}:${email}`;
    });
    
    _writeRateLimiter = memoryRateLimiter(60 * 1000, 100, (req) =>
        (req as any).user?.userId || req.ip
    );
    
    Logger.info('✅ Rate limiters initialized with in-memory fallback');
};

/**
 * Wrapper middleware that initializes rate limiter on first use
 */
export const userRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient) {
        Logger.warn('Redis not available, skipping rate limit');
        return next();
    }
    
    if (!_userRateLimiter) {
        await initRateLimiter();
    }
    
    if (_userRateLimiter) {
        _userRateLimiter(req, res, next);
    } else {
        next();
    }
};

/**
 * 🛡️ Rate Limiter pour les endpoints d'authentification
 * 
 * Limite plus stricte: 5 tentatives de login par 15 minutes
 */
export const authRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient) {
        Logger.warn('Redis not available, skipping auth rate limit');
        return next();
    }
    
    if (!_authRateLimiter) {
        await initRateLimiter();
    }
    
    if (_authRateLimiter) {
        _authRateLimiter(req, res, next);
    } else {
        next();
    }
};

/**
 * 🛡️ Rate Limiter pour les opérations d'écriture
 * 
 * Limite à 100 requêtes par minute pour les POST/PUT/PATCH/DELETE
 */
export const writeRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient) {
        Logger.warn('Redis not available, skipping write rate limit');
        return next();
    }
    
    if (!_writeRateLimiter) {
        await initRateLimiter();
    }
    
    if (_writeRateLimiter) {
        _writeRateLimiter(req, res, next);
    } else {
        next();
    }
};

/**
 * Initialize rate limiters - call this after Redis is connected
 */
export const initializeRateLimiters = async () => {
    if (redisClient) {
        await initRateLimiter();
    }
};
