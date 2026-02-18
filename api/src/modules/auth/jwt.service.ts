import jwt from 'jsonwebtoken';
import { config } from '@/config/app';
import crypto from 'crypto';

export interface JwtPayload {
    userId: string;
    email: string;
    organizationId: string | null;
    role: string;
}

/**
 * 🔐 Service JWT - Version Sécurisée
 * 
 * Gère la génération et la vérification des tokens JWT
 * Utilise des secrets différents pour access et refresh tokens
 */
class JwtService {
    private readonly accessSecret: string;
    private readonly refreshSecret: string;
    private readonly expiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor() {
        // Validate JWT secrets at startup - fail fast if misconfigured
        const MIN_SECRET_LENGTH = 32;
        
        if (!config.JWT_SECRET || config.JWT_SECRET.length < MIN_SECRET_LENGTH) {
            throw new Error(
                `CRITICAL SECURITY ERROR: JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters. ` +
                `Current length: ${config.JWT_SECRET?.length || 0}`
            );
        }
        
        if (!config.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET.length < MIN_SECRET_LENGTH) {
            throw new Error(
                `CRITICAL SECURITY ERROR: JWT_REFRESH_SECRET must be at least ${MIN_SECRET_LENGTH} characters. ` +
                `Current length: ${config.JWT_REFRESH_SECRET?.length || 0}`
            );
        }
        
        // Verify secrets are different
        if (config.JWT_SECRET === config.JWT_REFRESH_SECRET) {
            throw new Error(
                'CRITICAL SECURITY ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be different!'
            );
        }
        
        // Use validated secrets
        this.accessSecret = config.JWT_SECRET;
        this.refreshSecret = config.JWT_REFRESH_SECRET;
        this.expiresIn = config.JWT_EXPIRES_IN;
        this.refreshExpiresIn = config.JWT_REFRESH_EXPIRES_IN;
    }

    /**
     * Génère un access token JWT
     */
    generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.accessSecret, {
            expiresIn: this.expiresIn as any,
            issuer: 'sentinelle-reputation',
            audience: 'sentinelle-api',
            jwtid: crypto.randomUUID(), // JTI unique
            algorithm: 'HS256'
        });
    }

    /**
     * Génère un refresh token JWT
     * Utilise un SECRET DIFFÉRENT pour plus de sécurité
     */
    generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiresIn as any,
            issuer: 'sentinelle-reputation',
            audience: 'sentinelle-api',
            jwtid: crypto.randomUUID(), // JTI unique
            algorithm: 'HS256'
        });
    }

    /**
     * Vérifie et décode un access token JWT
     */
    verifyToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, this.accessSecret, {
                issuer: 'sentinelle-reputation',
                audience: 'sentinelle-api',
                algorithms: ['HS256']
            }) as JwtPayload;

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('TOKEN_EXPIRED');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('INVALID_TOKEN');
            }
            throw error;
        }
    }

    /**
     * Vérifie et décode un refresh token JWT
     * Utilise le refresh secret
     */
    verifyRefreshToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, this.refreshSecret, {
                issuer: 'sentinelle-reputation',
                audience: 'sentinelle-api',
                algorithms: ['HS256']
            }) as JwtPayload;

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('TOKEN_EXPIRED');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('INVALID_TOKEN');
            }
            throw error;
        }
    }

    /**
     * Décode un token sans le vérifier (utile pour debug seulement)
     * ⚠️ NE JAMAIS UTILISER POUR L'AUTHENTIFICATION
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            // decode ne vérifie PAS la signature!
            const decoded = jwt.decode(token);
            if (!decoded || typeof decoded === 'string') return null;
            return decoded as JwtPayload;
        } catch {
            return null;
        }
    }

    /**
     * Génère une paire de tokens (access + refresh)
     */
    generateTokenPair(payload: JwtPayload): { accessToken: string; refreshToken: string } {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }
}

export const jwtService = new JwtService();
