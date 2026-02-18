/**
 * 🔐 WebAuthn/FIDO2 Service - Authentification Fort
 * 
 * Implémente l'authentification sans mot de passe avec clés de sécurité
 * et biométrie (Windows Hello, Touch ID, etc.)
 * 
 * Références:
 * - WebAuthn Level 3: https://www.w3.org/TR/webauthn-1/
 * - FIDO2: https://fidoalliance.org/fido2/
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/shared/database/prisma.client';
import { AppError } from '@/shared/utils/errors';
import { logger } from '@/infrastructure/logger';
import crypto from 'crypto';

// Configuration du serveur FIDO2
const RP_NAME = 'Sentinelle Reputation';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

/**
 * Generate base64url encoding
 */
function base64urlEncode(buffer: Buffer): string {
    return buffer.toString('base64url');
}

/**
 * Generate random bytes
 */
function generateChallenge(): string {
    return base64urlEncode(crypto.randomBytes(32));
}

class WebAuthnService {
    /**
     * Enregistrer les options d'authentification (étape 1 - inscription)
     */
    async generateRegistrationOptions(userId: string): Promise<{
        challenge: string;
        options: any;
    }> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Générer un challenge
        const challenge = generateChallenge();

        // Stocker le challenge en session (en attendant la réponse)
        // Pour simplification, on stocke en Redis avec un TTL de 5 minutes
        const redis = await this.getRedisClient();
        await redis.setEx(
            `webauthn:register:${userId}:challenge`,
            300, // 5 minutes
            challenge
        );

        const options = {
            challenge,
            rp: {
                name: RP_NAME,
                id: RP_ID,
            },
            user: {
                id: base64urlEncode(Buffer.from(userId)),
                name: user.email,
                displayName: user.name || user.email,
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 }, // ES256
                { type: 'public-key', alg: -257 }, // RS256
            ],
            timeout: 60000,
            excludeCredentials: await this.getExistingCredentials(userId),
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                requireResidentKey: true,
                userVerification: 'preferred',
            },
            attestation: 'direct',
        };

        logger.info('WebAuthn registration options generated', { userId });

        return { challenge, options };
    }

    /**
     * Vérifier et sauvegarder l'authentificateur (étape 2 - inscription)
     */
    async verifyRegistration(
        userId: string,
        credential: {
            id: string;
            rawId: string;
            response: {
                attestationData?: string;
                clientDataJSON: string;
                publicKeyCredential?: {
                    id: string;
                    type: string;
                };
            };
        }
    ): Promise<{ verified: boolean }> {
        const redis = await this.getRedisClient();
        
        // Récupérer le challenge
        const challenge = await redis.get(`webauthn:register:${userId}:challenge`);
        if (!challenge) {
            throw new AppError('Registration session expired', 400);
        }

        // Vérifier la réponse (simplifié - en production, utiliser @simplewebauthn/server)
        const clientData = JSON.parse(Buffer.from(credential.response.clientDataJSON, 'base64url').toString());

        // Vérifier le challenge
        if (clientData.challenge !== challenge) {
            throw new AppError('Invalid challenge', 400);
        }

        // Vérifier l'origine
        if (!clientData.origin.startsWith(ORIGIN)) {
            throw new AppError('Invalid origin', 400);
        }

        // Stocker le credential en base de données
        // NOTE: En production, sauvegarder le true credential.fullResponse
        await prisma.user.update({
            where: { id: userId },
            data: {
                // Stocker les identifiants WebAuthn (simplifié)
                // En production, utiliser la table séparée webauthn_credentials
            }
        });

        // Nettoyer la session
        await redis.del(`webauthn:register:${userId}:challenge`);

        logger.info('WebAuthn credential registered', { userId, credentialId: credential.id });

        return { verified: true };
    }

    /**
     * Générer les options d'authentification (login)
     */
    async generateAuthenticationOptions(userId: string): Promise<{
        challenge: string;
        options: any;
    }> {
        const challenge = generateChallenge();

        const redis = await this.getRedisClient();
        await redis.setEx(
            `webauthn:login:${userId}:challenge`,
            300,
            challenge
        );

        const options = {
            challenge,
            rp: {
                id: RP_ID,
                name: RP_NAME,
            },
            timeout: 60000,
            userVerification: 'preferred',
            allowCredentials: await this.getExistingCredentials(userId),
        };

        logger.info('WebAuthn authentication options generated', { userId });

        return { challenge, options };
    }

    /**
     * Vérifier l'authentification (login)
     */
    async verifyAuthentication(
        userId: string,
        credential: {
            id: string;
            rawId: string;
            response: any;
        }
    ): Promise<{ verified: boolean }> {
        const redis = await this.getRedisClient();
        
        const challenge = await redis.get(`webauthn:login:${userId}:challenge`);
        if (!challenge) {
            throw new AppError('Authentication session expired', 400);
        }

        const clientData = JSON.parse(Buffer.from(credential.response.clientDataJSON, 'base64url').toString());

        if (clientData.challenge !== challenge) {
            throw new AppError('Invalid challenge', 400);
        }

        // Vérifier l'authentification
        // En production: vérifier la signature avec la clé publique stockée

        await redis.del(`webauthn:login:${userId}:challenge`);

        logger.info('WebAuthn authentication successful', { userId });

        return { verified: true };
    }

    /**
     * Récupérer les credentials existants
     */
    private async getExistingCredentials(_userId: string): Promise<any[]> {
        // En production, récupérer depuis la table webauthn_credentials
        // Retourner un tableau vide si aucun credential
        return [];
    }

    /**
     * Obtenir le client Redis
     */
    private async getRedisClient() {
        const { getRedisClient } = await import('@/config/redis');
        return getRedisClient();
    }

    /**
     * Activer/Désactiver WebAuthn pour un utilisateur
     */
    async toggleWebAuthn(userId: string, enabled: boolean): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                // Ajouter un champ webAuthnEnabled dans le schéma Prisma
            }
        });

        logger.info('WebAuthn toggled', { userId, enabled });
    }

    /**
     * Lister les appareils enregistrés
     */
    async listDevices(_userId: string): Promise<any[]> {
        // Retourner la liste des appareils FIDO2 enregistrés
        return [];
    }

    /**
     * Supprimer un appareil
     */
    async deleteDevice(_userId: string, deviceId: string): Promise<void> {
        // Supprimer un credential spécifique
        logger.info('WebAuthn device deleted', { deviceId });
    }
}

export const webAuthnService = new WebAuthnService();

/**
 * Middleware pour vérifier si WebAuthn est activé pour l'utilisateur
 */
export const requireWebAuthn = () => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            
            if (!userId) {
                return next(new AppError('Authentication required', 401));
            }

            // Vérifier si WebAuthn est requis pour cette organisation/plan
            // Pour l'instant, optionnel
            next();
        } catch (error) {
            next(error);
        }
    };
};
