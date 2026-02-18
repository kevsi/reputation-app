/**
 * 🔐 Token Blacklist Service
 * 
 * Gère la liste noire des tokens JWT pour revoke l'accès.
 * Utilise Redis pour le stockage distribué.
 */

import { getRedisClient } from '@/config/redis';
import { logger } from '@/infrastructure/logger';

const BLACKLIST_PREFIX = 'token:blacklist:';
const BLACKLIST_TTL = 7 * 24 * 60 * 60; // 7 jours en secondes (correspond au refresh token expiry)

interface TokenPayload {
    userId: string;
    email: string;
    organizationId: string | null;
    role: string;
    iat?: number;
    exp?: number;
}

class TokenBlacklistService {
    /**
     * Ajoute un token à la blacklist
     */
    async addToBlacklist(token: string, payload: TokenPayload): Promise<void> {
        try {
            const redis = await getRedisClient();
            const key = this.getBlacklistKey(token);
            
            // Stocker le payload pour audit
            const auditData = JSON.stringify({
                userId: payload.userId,
                email: payload.email,
                revokedAt: new Date().toISOString(),
                expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null
            });
            
            await redis.setEx(key, BLACKLIST_TTL, auditData);
            logger.info('Token added to blacklist', { userId: payload.userId });
        } catch (error) {
            logger.error('Failed to add token to blacklist', error);
            // Ne pas throw pour ne pas bloquer l'opération principale
        }
    }

    /**
     * Vérifie si un token est blacklisté
     */
    async isBlacklisted(token: string): Promise<boolean> {
        try {
            const redis = await getRedisClient();
            const key = this.getBlacklistKey(token);
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            logger.error('Failed to check token blacklist', error);
            // En cas d'erreur, laisser passer (fail open pour éviter de bloquer les utilisateurs)
            return false;
        }
    }

    /**
     * Récupère les infos de révocation d'un token
     */
    async getBlacklistInfo(token: string): Promise<{ userId: string; revokedAt: string } | null> {
        try {
            const redis = await getRedisClient();
            const key = this.getBlacklistKey(token);
            const data = await redis.get(key);
            
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            return {
                userId: parsed.userId,
                revokedAt: parsed.revokedAt
            };
        } catch (error) {
            logger.error('Failed to get blacklist info', error);
            return null;
        }
    }

    /**
     * Nettoie les tokens expirés automatiquement (Redis s'occupe du TTL)
     */
    async cleanupExpired(): Promise<void> {
        // Pas nécessaire car Redis gère le TTL automatiquement
        // Cette méthode peut être utilisée pour du logging ou des métriques
        logger.info('Token blacklist cleanup triggered (Redis manages TTL automatically)');
    }

    /**
     * Génère la clé Redis pour un token
     */
    private getBlacklistKey(token: string): string {
        // Utiliser le hash du token pour éviter de stocker le token en clair
        return `${BLACKLIST_PREFIX}${this.hashToken(token)}`;
    }

    /**
     * Hash simple du token pour la clé
     */
    private hashToken(token: string): string {
        // Utiliser les premiers caractères du token comme identifiant
        // Le token JWT est structuré: header.payload.signature
        const parts = token.split('.');
        if (parts.length === 3) {
            // Retourner les 2 premières parties (header + payload) comme identifiant
            return `${parts[0]}.${parts[1]}`;
        }
        // Fallback: hash simple
        return token.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '');
    }
}

export const tokenBlacklistService = new TokenBlacklistService();
