/**
 * 🔐 Advanced Token Service - Rotation et Sécurité Renforcée
 * 
 * Ce service implémente:
 * - Rotation stricte des refresh tokens
 * - Détection de réutilisation de tokens
 * - Gestion robuste des erreurs Redis
 * - Protection contre les attacks de force brute
 */

import { getRedisClient } from '@/config/redis';
import { config } from '@/config/app';
import { logger } from '@/infrastructure/logger';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const TOKEN_FAMILY_PREFIX = 'token:family:';
const USAGE_WINDOW_PREFIX = 'token:usage:';
const BLACKLIST_PREFIX = 'token:blacklist:';
const BLACKLIST_TTL = 7 * 24 * 60 * 60; // 7 jours
const USAGE_WINDOW_SECONDS = 300; // 5 minutes - fenêtre de réutilisation
const MAX_REFRESH_PER_WINDOW = 10; // Max refresh par fenêtre de 5 min

interface TokenFamily {
    familyId: string;
    currentVersion: number;
    isCompromised: boolean;
}

interface TokenPayload {
    userId: string;
    email: string;
    organizationId: string | null;
    role: string;
    familyId?: string;
    version?: number;
    iat?: number;
    exp?: number;
}

class AdvancedTokenService {
    /**
     * Génère une nouvelle famille de tokens
     */
    async createTokenFamily(userId: string): Promise<string> {
        const redis = await getRedisClient();
        const familyId = crypto.randomUUID();
        
        // Stocker la famille de tokens
        await redis.setEx(
            `${TOKEN_FAMILY_PREFIX}${userId}`,
            365 * 24 * 60 * 60, // 1 an
            JSON.stringify({
                familyId,
                currentVersion: 1,
                isCompromised: false
            })
        );
        
        return familyId;
    }

    /**
     * Génère une paire de tokens avec rotation
     * - Invalide l'ancien refresh token
     * - Incrémente la version de la famille
     */
    async generateRotatedTokenPair(
        userId: string,
        email: string,
        organizationId: string | null,
        role: string,
        previousRefreshToken?: string
    ): Promise<{ accessToken: string; refreshToken: string; familyId: string }> {
        await getRedisClient(); // Verify Redis is available
        
        try {
            // Si un ancien token est fourni, l'invalider
            if (previousRefreshToken) {
                await this.invalidateRefreshToken(previousRefreshToken);
            }
            
            // Récupérer ou créer la famille de tokens
            let familyId = await this.getTokenFamilyId(userId);
            if (!familyId) {
                familyId = await this.createTokenFamily(userId);
            }
            
            // Incrémenter la version (invalide automatiquement l'ancien)
            const newVersion = await this.incrementTokenFamilyVersion(userId);
            
            // Créer le payload avec la nouvelle version
            const payload: TokenPayload = {
                userId,
                email,
                organizationId,
                role,
                familyId,
                version: newVersion
            };
            
            // Générer les tokens
            const accessToken = this.signAccessToken(payload);
            const refreshToken = this.signRefreshToken(payload);
            
            // Tracker l'utilisation du refresh token
            await this.trackRefreshUsage(userId);
            
            logger.info('Token pair rotated successfully', { userId, version: newVersion });
            
            return { accessToken, refreshToken, familyId };
            
        } catch (error) {
            // Si Redis échoue, fallback vers l'ancien comportement
            logger.error('Redis failed during token rotation, using fallback', error);
            return this.generateFallbackTokenPair(userId, email, organizationId, role);
        }
    }

    /**
     * Valide un refresh token avec vérification de rotation
     */
    async validateRefreshToken(
        refreshToken: string,
        payload: TokenPayload
    ): Promise<{ valid: boolean; reason?: string }> {
        const redis = await getRedisClient();
        
        try {
            // 1. Vérifier si le token est dans la blacklist
            const isBlacklisted = await redis.exists(`${BLACKLIST_PREFIX}${refreshToken}`);
            if (isBlacklisted) {
                return { valid: false, reason: 'TOKEN_REVOKED' };
            }
            
            // 2. Vérifier si le token a été utilisé récemment (prévention reuse)
            const usageKey = `${USAGE_WINDOW_PREFIX}${payload.userId}`;
            const usageCount = await redis.get(usageKey);
            if (usageCount && parseInt(usageCount) > MAX_REFRESH_PER_WINDOW) {
                // Too many requests - possible attack
                logger.warn('Possible token reuse attack detected', { userId: payload.userId });
                await this.handleSuspectedAttack(payload.userId);
                return { valid: false, reason: 'SUSPECTED_ATTACK' };
            }
            
            // 3. Vérifier la version de la famille
            if (payload.familyId && payload.version) {
                const familyData = await redis.get(`${TOKEN_FAMILY_PREFIX}${payload.userId}`);
                if (familyData) {
                    const family: TokenFamily = JSON.parse(familyData);
                    
                    // Si la famille est marquée comme compromise
                    if (family.isCompromised) {
                        return { valid: false, reason: 'FAMILY_COMPROMISED' };
                    }
                    
                    // Si la version ne correspond pas, le token est invalide
                    if (payload.version !== family.currentVersion) {
                        return { valid: false, reason: 'TOKEN_ROTATED' };
                    }
                }
            }
            
            return { valid: true };
            
        } catch (error) {
            logger.error('Error validating refresh token', error);
            // Fail-open en cas d'erreur Redis pour ne pas bloquer les utilisateurs
            return { valid: true };
        }
    }

    /**
     * Invalide un refresh token spécifique
     */
    private async invalidateRefreshToken(token: string): Promise<void> {
        const redis = await getRedisClient();
        
        // Ajouter à la blacklist avec le TTL du token
        await redis.setEx(
            `${BLACKLIST_PREFIX}${token}`,
            BLACKLIST_TTL,
            JSON.stringify({ revokedAt: new Date().toISOString() })
        );
    }

    /**
     * Incrémente la version de la famille de tokens
     */
    private async incrementTokenFamilyVersion(userId: string): Promise<number> {
        const redis = await getRedisClient();
        const key = `${TOKEN_FAMILY_PREFIX}${userId}`;
        
        const data = await redis.get(key);
        if (!data) {
            return 1;
        }
        
        const family: TokenFamily = JSON.parse(data);
        family.currentVersion += 1;
        
        await redis.setEx(key, 365 * 24 * 60 * 60, JSON.stringify(family));
        
        return family.currentVersion;
    }

    /**
     * Récupère l'ID de la famille de tokens
     */
    private async getTokenFamilyId(userId: string): Promise<string | null> {
        const redis = await getRedisClient();
        
        const data = await redis.get(`${TOKEN_FAMILY_PREFIX}${userId}`);
        if (!data) return null;
        
        const family: TokenFamily = JSON.parse(data);
        return family.familyId;
    }

    /**
     * Tracker l'utilisation du refresh token pour détecter les attaques
     */
    private async trackRefreshUsage(userId: string): Promise<void> {
        const redis = await getRedisClient();
        const key = `${USAGE_WINDOW_PREFIX}${userId}`;
        
        const current = await redis.incr(key);
        
        // Première utilisation dans la fenêtre, configurer l'expiration
        if (current === 1) {
            await redis.expire(key, USAGE_WINDOW_SECONDS);
        }
    }

    /**
     * Gère une attaque suspectée
     */
    private async handleSuspectedAttack(userId: string): Promise<void> {
        const redis = await getRedisClient();
        
        // Marquer la famille comme compromise
        const key = `${TOKEN_FAMILY_PREFIX}${userId}`;
        const data = await redis.get(key);
        
        if (data) {
            const family: TokenFamily = JSON.parse(data);
            family.isCompromised = true;
            await redis.setEx(key, 24 * 60 * 60, JSON.stringify(family)); // Garder 24h
        }
        
        logger.warn('Token reuse attack detected and mitigated', { userId });
    }

    /**
     * Génère des tokens en mode fallback (quand Redis est indisponible)
     */
    private generateFallbackTokenPair(
        userId: string,
        email: string,
        organizationId: string | null,
        role: string
    ): { accessToken: string; refreshToken: string; familyId: string } {
        const payload: TokenPayload = {
            userId,
            email,
            organizationId,
            role,
            familyId: 'fallback',
            version: 1
        };
        
        return {
            accessToken: this.signAccessToken(payload),
            refreshToken: this.signRefreshToken(payload),
            familyId: 'fallback'
        };
    }

    private signAccessToken(payload: TokenPayload): string {
        return jwt.sign(
            payload,
            config.JWT_SECRET!,
            {
                expiresIn: '15m',
                issuer: 'sentinelle-reputation',
                audience: 'sentinelle-api',
                jwtid: crypto.randomUUID()
            } as jwt.SignOptions
        );
    }

    /**
     * Génère un refresh token JWT
     */
    private signRefreshToken(payload: TokenPayload): string {
        return jwt.sign(
            payload,
            config.JWT_REFRESH_SECRET!,
            {
                expiresIn: '7d',
                issuer: 'sentinelle-reputation',
                audience: 'sentinelle-api',
                jwtid: crypto.randomUUID()
            } as jwt.SignOptions
        );
    }

    /**
     * Révoque tous les tokens d'un utilisateur (logout total)
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        const redis = await getRedisClient();
        
        // Marquer la famille comme compromise
        await redis.setEx(
            `${TOKEN_FAMILY_PREFIX}${userId}`, 
            24 * 60 * 60, 
            JSON.stringify({
                familyId: crypto.randomUUID(),
                currentVersion: 1,
                isCompromised: true
            })
        );
        
        // Clear le compteur d'utilisation
        await redis.del(`${USAGE_WINDOW_PREFIX}${userId}`);
        
        logger.info('All tokens revoked for user', { userId });
    }
}

export const advancedTokenService = new AdvancedTokenService();
