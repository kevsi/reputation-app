/**
 * 📊 Métriques de Sécurité - Prometheus
 * 
 * Collecte des métriques pour:
 * - Tokens révoqués
 * - Refresh tokens
 * - Tentatives de connexion
 * - Attaques détectées
 */

import promClient from 'prom-client';

// Créer un registre de métriques
export const register = new promClient.Registry();

// Ajouter le default metrics (CPU, mémoire, etc.)
promClient.collectDefaultMetrics({ register });

// ============================================
// MÉTRIQUES AUTHENTIFICATION
// ============================================

// Compteur de connexions
export const loginAttemptsTotal = new promClient.Counter({
    name: 'auth_login_attempts_total',
    help: 'Total des tentatives de connexion',
    labelNames: ['status', 'method'],
    registers: [register],
});

// Compteur de refresh tokens
export const refreshTokensTotal = new promClient.Counter({
    name: 'auth_refresh_tokens_total',
    help: 'Total des refresh tokens',
    labelNames: ['status'],
    registers: [register],
});

// Compteur de tokens révoqués
export const tokensRevokedTotal = new promClient.Counter({
    name: 'auth_tokens_revoked_total',
    help: 'Total des tokens révoqués',
    labelNames: ['reason', 'user_id'],
    registers: [register],
});

// Compteur d'attaques détectées
export const attacksDetectedTotal = new promClient.Counter({
    name: 'auth_attacks_detected_total',
    help: 'Total des attaques détectées',
    labelNames: ['type', 'ip'],
    registers: [register],
});

// Gauge des sessions actives
export const activeSessions = new promClient.Gauge({
    name: 'auth_active_sessions',
    help: 'Nombre de sessions actives',
    labelNames: ['user_id'],
    registers: [register],
});

// Histogramme des durées de session
export const sessionDuration = new promClient.Histogram({
    name: 'auth_session_duration_seconds',
    help: 'Durée des sessions en secondes',
    labelNames: ['user_id'],
    buckets: [60, 300, 900, 3600, 7200, 14400, 28800, 86400],
    registers: [register],
});

// Histogramme des latences d'authentification
export const authLatency = new promClient.Histogram({
    name: 'auth_operation_duration_seconds',
    help: 'Durée des opérations d\'authentification',
    labelNames: ['operation', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register],
});

// ============================================
// MÉTRIQUES TOKEN & SESSIONS
// ============================================

// Gauge des familles de tokens
export const tokenFamiliesTotal = new promClient.Gauge({
    name: 'auth_token_families_total',
    help: 'Nombre total de familles de tokens',
    registers: [register],
});

// Gauge des tokens blacklistés
export const blacklistedTokens = new promClient.Gauge({
    name: 'auth_blacklisted_tokens',
    help: 'Nombre de tokens blacklistés',
    registers: [register],
});

// Compteur de credentials WebAuthn
export const webAuthnCredentialsTotal = new promClient.Counter({
    name: 'auth_webauthn_credentials_total',
    help: 'Total des credentials WebAuthn',
    labelNames: ['action'], // 'created', 'deleted', 'used'
    registers: [register],
});

// Histogramme de la durée de rotation des tokens
export const tokenRotationDuration = new promClient.Histogram({
    name: 'auth_token_rotation_duration_seconds',
    help: 'Durée de la rotation des tokens',
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1],
    registers: [register],
});

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Enregistre une tentative de connexion
 */
export function recordLoginAttempt(status: 'success' | 'failed' | 'locked', method: 'password' | 'webauthn' | 'refresh' = 'password') {
    loginAttemptsTotal.inc({ status, method });
}

/**
 * Enregistre un refresh token
 */
export function recordRefreshToken(status: 'success' | 'failed' | 'expired' | 'revoked') {
    refreshTokensTotal.inc({ status });
}

/**
 * Enregistre un token révoqué
 */
export function recordTokenRevoked(reason: 'logout' | 'password_change' | 'security' | 'attack', userId: string) {
    tokensRevokedTotal.inc({ reason, user_id: userId });
}

/**
 * Enregistre une attaque détectée
 */
export function recordAttack(type: 'brute_force' | 'token_reuse' | 'credential_stuffing' | 'suspicious_ip', ip: string) {
    attacksDetectedTotal.inc({ type, ip });
}

/**
 * Met à jour le nombre de sessions actives
 */
export function setActiveSession(userId: string, count: number) {
    activeSessions.set({ user_id: userId }, count);
}

/**
 * Enregistre la durée d'une session
 */
export function recordSessionDuration(userId: string, durationSeconds: number) {
    sessionDuration.observe({ user_id: userId }, durationSeconds);
}

/**
 * Enregistre la latence d'une opération
 */
export function recordAuthLatency(operation: 'login' | 'refresh' | 'logout' | 'register', status: 'success' | 'error', duration: number) {
    authLatency.observe({ operation, status }, duration);
}

// ============================================
// MIDDLEWARE POUR EXPOSER LES MÉTRIQUES
// ============================================

import { Request, Response } from 'express';

/**
 * Middleware pour exposer les métriques Prometheus
 */
export const metricsMiddleware = async (_req: Request, res: Response) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error);
    }
};
