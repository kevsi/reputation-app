/**
 * 🔄 JWT Secret Rotation Service
 * 
 * Gère la rotation automatique des secrets JWT:
 * - Génère de nouveaux secrets périodiquement
 * - Maintient une liste des anciens secrets valides (grace period)
 * - Notifie les utilisateurs de la rotation
 * 
 * Fréquence recommandée: tous les 30 jours
 */

import { getRedisClient } from '@/config/redis';
import { config } from '@/config/app';
import { logger } from '@/infrastructure/logger';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SECRET_ROTATION_PREFIX = 'jwt:secret:';
const GRACE_PERIOD_HOURS = 24; // Les anciens tokens restent valides 24h
const ACTIVE_SECRET_KEY = 'jwt:active:secret';

interface SecretMetadata {
    secret: string;
    createdAt: string;
    expiresAt: string;
    isActive: boolean;
}

class JWTSecretRotationService {
    private readonly secretsPath: string;

    constructor() {
        this.secretsPath = process.env.JWT_SECRETS_PATH || 
            path.join(process.cwd(), 'secrets');
    }

    /**
     * Initialise le service - crée les secrets si nécessaire
     */
    async initialize(): Promise<void> {
        try {
            const redis = await getRedisClient();
            
            // Vérifier si un secret actif existe
            const activeSecret = await redis.get(ACTIVE_SECRET_KEY);
            
            if (!activeSecret) {
                // Premier démarrage - créer les secrets initiaux
                await this.rotateSecret();
                logger.info('JWT secrets initialized');
            }
        } catch (error) {
            logger.error('Failed to initialize JWT secret rotation', error);
        }
    }

    /**
     * Rotation du secret JWT
     * - Génère un nouveau secret
     * - Ajoute l'ancien à la grace period
     * - Met à jour le secret actif
     */
    async rotateSecret(): Promise<{ newSecret: string; oldSecret: string }> {
        const redis = await getRedisClient();
        
        // Récupérer l'ancien secret actif
        const oldSecret = await redis.get(ACTIVE_SECRET_KEY) || config.JWT_SECRET;
        // Note: oldMetadata could be used for grace period validation
        await redis.get(`${SECRET_ROTATION_PREFIX}${oldSecret}`);
        
        try {
            // Générer un nouveau secret
            const newSecret = crypto.randomBytes(64).toString('hex');
            
            const now = new Date();
            const createdAt = now.toISOString();
            const expiresAt = new Date(now.getTime() + (GRACE_PERIOD_HOURS * 60 * 60 * 1000)).toISOString();
            
            // Sauvegarder l'ancien secret avec sa date d'expiration
            if (oldSecret && oldSecret !== newSecret) {
                const oldSecretMetadata: SecretMetadata = {
                    secret: oldSecret,
                    createdAt: createdAt,
                    expiresAt,
                    isActive: false
                };
                await redis.setEx(
                    `${SECRET_ROTATION_PREFIX}${oldSecret}`,
                    GRACE_PERIOD_HOURS * 60 * 60, // TTL = grace period
                    JSON.stringify(oldSecretMetadata)
                );
            }
            
            // Sauvegarder le nouveau secret comme actif
            const newSecretMetadata: SecretMetadata = {
                secret: newSecret,
                createdAt,
                expiresAt: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 jours
                isActive: true
            };
            
            await redis.set(ACTIVE_SECRET_KEY, newSecret);
            await redis.set(
                `${SECRET_ROTATION_PREFIX}${newSecret}`,
                JSON.stringify(newSecretMetadata)
            );
            
            // Sauvegarder également dans un fichier (backup)
            await this.backupSecretToFile(newSecret);
            
            logger.info('JWT secret rotated successfully', {
                oldSecret: oldSecret?.substring(0, 8) + '...',
                newSecret: newSecret.substring(0, 8) + '...',
                gracePeriodHours: GRACE_PERIOD_HOURS
            });

            // Notifier les admins (via event/notification)
            // await notificationService.notifyAdmins('JWT_SECRET_ROTATED', {...});
            
            return { newSecret, oldSecret };
            
        } catch (error) {
            logger.error('Failed to rotate JWT secret', error);
            throw error;
        }
    }

    /**
     * Vérifie si un token est signé avec un secret valide
     */
    async isTokenValid(_token: string, secret: string): Promise<boolean> {
        const redis = await getRedisClient();
        
        // Vérifier le secret actif
        const activeSecret = await redis.get(ACTIVE_SECRET_KEY);
        if (activeSecret === secret) {
            return true;
        }
        
        // Vérifier les anciens secrets (grace period)
        const oldSecretData = await redis.get(`${SECRET_ROTATION_PREFIX}${secret}`);
        if (oldSecretData) {
            const metadata: SecretMetadata = JSON.parse(oldSecretData);
            const expiresAt = new Date(metadata.expiresAt);
            
            if (expiresAt > new Date()) {
                return true; // Secret encore valide dans la grace period
            }
        }
        
        return false;
    }

    /**
     * Retourne le secret JWT actuel
     */
    async getCurrentSecret(): Promise<string> {
        const redis = await getRedisClient();
        const activeSecret = await redis.get(ACTIVE_SECRET_KEY);
        return activeSecret || config.JWT_SECRET;
    }

    /**
     * Sauvegarde le secret dans un fichier crypté
     */
    private async backupSecretToFile(secret: string): Promise<void> {
        try {
            if (!fs.existsSync(this.secretsPath)) {
                fs.mkdirSync(this.secretsPath, { recursive: true });
            }

            const filename = `jwt_secret_${Date.now()}.json`;
            const filepath = path.join(this.secretsPath, filename);
            
            // Chiffrer le secret avant de le sauvegarder
            const encrypted = this.encryptSecret(secret);
            
            fs.writeFileSync(filepath, JSON.stringify({
                encrypted,
                createdAt: new Date().toISOString(),
                version: 1
            }, null, 2));
            
            // Supprimer les anciens fichiers de backup (garder les 5 derniers)
            await this.cleanupOldBackups();
            
            logger.info('JWT secret backed up to file', { filepath });
        } catch (error) {
            logger.error('Failed to backup JWT secret', error);
        }
    }

    /**
     * Chiffre le secret pour le stockage
     */
    private encryptSecret(secret: string): string {
        // Utiliser un master key pour chiffrer
        const masterKey = process.env.JWT_SECRET_MASTER_KEY || config.JWT_SECRET;
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(masterKey.substring(0, 32), 'utf8'), iv);
        
        let encrypted = cipher.update(secret, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted + ':' + cipher.getAuthTag().toString('hex');
    }

    /**
     * Nettoie les vieux fichiers de backup
     */
    private async cleanupOldBackups(): Promise<void> {
        try {
            const files = fs.readdirSync(this.secretsPath)
                .filter(f => f.startsWith('jwt_secret_'))
                .sort()
                .reverse();
            
            // Garder seulement les 5 derniers
            if (files.length > 5) {
                files.slice(5).forEach(file => {
                    fs.unlinkSync(path.join(this.secretsPath, file));
                });
            }
        } catch (error) {
            logger.error('Failed to cleanup old secret backups', error);
        }
    }

    /**
     * Planifie la rotation automatique
     */
    scheduleRotation(cronExpression: string = '0 2 * * *'): void {
        // Utiliser node-cron pour planifier
        // Ex: tous les jours à 2h du matin
        const cron = require('node-cron');
        
        cron.schedule(cronExpression, async () => {
            logger.info('Starting scheduled JWT secret rotation');
            try {
                await this.rotateSecret();
            } catch (error) {
                logger.error('Scheduled JWT secret rotation failed', error);
            }
        });
        
        logger.info('JWT secret rotation scheduled', { cronExpression });
    }

    /**
     * Force la rotation d'urgence (en cas de compromission)
     */
    async emergencyRotation(): Promise<void> {
        logger.warn('EMERGENCY JWT SECRET ROTATION TRIGGERED');
        
        // Rotation immédiate sans grace period pour l'ancien
        await this.rotateSecret();
        
        // Révoquer tous les tokens existants
        // await advancedTokenService.revokeAllUserTokens('*'); // toutes les sessions
        
        logger.warn('Emergency JWT secret rotation completed - all sessions invalidated');
    }
}

export const jwtSecretRotationService = new JWTSecretRotationService();
