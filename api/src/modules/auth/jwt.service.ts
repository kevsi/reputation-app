import jwt from 'jsonwebtoken';
import { config } from '@/config/app';

export interface JwtPayload {
    userId: string;
    email: string;
    organizationId: string | null;
    role: string;
}

/**
 * 🔐 Service JWT
 * 
 * Gère la génération et la vérification des tokens JWT
 */
class JwtService {
    private readonly secret: string;
    private readonly expiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor() {
        this.secret = config.JWT_SECRET;
        this.expiresIn = config.JWT_EXPIRES_IN;
        this.refreshExpiresIn = config.JWT_REFRESH_EXPIRES_IN;
    }

    /**
     * Génère un access token JWT
     */
    generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn as any,
            issuer: 'sentinelle-reputation',
            audience: 'sentinelle-api',
        });
    }

    /**
     * Génère un refresh token JWT
     */
    generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.secret, {
            expiresIn: this.refreshExpiresIn as any,
            issuer: 'sentinelle-reputation',
            audience: 'sentinelle-api',
        });
    }

    /**
     * Vérifie et décode un token JWT
     */
    verifyToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, this.secret, {
                issuer: 'sentinelle-reputation',
                audience: 'sentinelle-api',
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
     * Décode un token sans le vérifier (utile pour debug)
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            return jwt.decode(token) as JwtPayload;
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
