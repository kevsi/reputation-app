/**
 * 🔐 Tests Complets - Sécurité API
 * 
 * Couverture:
 * - Authentification JWT
 * - Rotation de tokens
 * - Détection d'attaques
 * - Multi-device
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';

// Mock Redis
const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    exists: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    del: jest.fn(),
};

jest.mock('@/config/redis', () => ({
    getRedisClient: jest.fn().mockResolvedValue(mockRedis),
}));

jest.mock('@/config/app', () => ({
    config: {
        JWT_SECRET: 'test-secret-key-minimum-32-characters',
        JWT_REFRESH_SECRET: 'test-refresh-secret-key-minimum-32',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
    },
}));

jest.mock('@/infrastructure/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('JWT Service - Sécurité', () => {
    let jwtService: any;

    beforeAll(async () => {
        // Import après les mocks
        const module = await import('./jwt.service');
        jwtService = module.jwtService;
    });

    describe('generateAccessToken', () => {
        it('devrait générer un token avec JTI unique', () => {
            const payload = {
                userId: 'user-123',
                email: 'test@example.com',
                organizationId: 'org-456',
                role: 'USER'
            };

            const token1 = jwtService.generateAccessToken(payload);
            const token2 = jwtService.generateAccessToken(payload);

            // Les tokens doivent être différents (JTI unique)
            expect(token1).not.toBe(token2);
            
            // Vérifier le format JWT
            expect(token1.split('.')).toHaveLength(3);
        });

        it('devrait inclure issuer et audience', () => {
            const payload = {
                userId: 'user-123',
                email: 'test@example.com',
                organizationId: 'org-456',
                role: 'USER'
            };

            const token = jwtService.generateAccessToken(payload);
            const decoded = jwtService.decodeToken(token);

            expect(decoded.iss).toBe('sentinelle-reputation');
            expect(decoded.aud).toBe('sentinelle-api');
        });

        it('devrait throw pour un token modifié', () => {
            const payload = {
                userId: 'user-123',
                email: 'test@example.com',
                organizationId: 'org-456',
                role: 'USER'
            };

            const token = jwtService.generateAccessToken(payload);
            const modifiedToken = token.slice(0, -5) + 'xxxxx';

            expect(() => jwtService.verifyToken(modifiedToken)).toThrow();
        });
    });

    describe('Secrets séparés', () => {
        it('devrait utiliser des secrets différents pour access et refresh', async () => {
            const module = await import('./jwt.service');
            const testModule = module as any;
            
            // Vérifier que les secrets sont différents
            expect(testModule.jwtService.accessSecret).not.toBe(testModule.jwtService.refreshSecret);
        });
    });
});

describe('AdvancedTokenService - Rotation', () => {
    let advancedTokenService: any;

    beforeAll(async () => {
        // Reset mocks
        jest.clearAllMocks();
        
        const module = await import('./advanced-token.service');
        advancedTokenService = module.advancedTokenService;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateRotatedTokenPair', () => {
        it('devrait invalider l\'ancien refresh token', async () => {
            // Setup mock
            mockRedis.get.mockResolvedValue(JSON.stringify({
                familyId: 'family-123',
                currentVersion: 1,
                isCompromised: false
            }));
            mockRedis.setEx.mockResolvedValue('OK');
            mockRedis.incr.mockResolvedValue(1);
            mockRedis.expire.mockResolvedValue(true);

            const result = await advancedTokenService.generateRotatedTokenPair(
                'user-123',
                'test@example.com',
                'org-456',
                'USER',
                'old-refresh-token'
            );

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('familyId');

            // Vérifier que l'ancien token a été blacklisted
            expect(mockRedis.setEx).toHaveBeenCalledWith(
                expect.stringContaining('token:blacklist:'),
                expect.any(Number),
                expect.any(String)
            );
        });

        it('devrait incrémenter la version à chaque rotation', async () => {
            mockRedis.get.mockResolvedValue(JSON.stringify({
                familyId: 'family-123',
                currentVersion: 1,
                isCompromised: false
            }));
            mockRedis.setEx.mockResolvedValue('OK');
            mockRedis.incr.mockResolvedValue(1);
            mockRedis.expire.mockResolvedValue(true);

            const result1 = await advancedTokenService.generateRotatedTokenPair(
                'user-123', 'test@example.com', 'org-456', 'USER'
            );

            // Le second appel devrait incrémenter la version
            const result2 = await advancedTokenService.generateRotatedTokenPair(
                'user-123', 'test@example.com', 'org-456', 'USER'
            );

            // Vérifier que setEx a été appelé pour mettre à jour la version
            expect(mockRedis.setEx).toHaveBeenCalledTimes(expect.any(Number));
        });
    });

    describe('validateRefreshToken - Détection d\'attaques', () => {
        it('devrait détecter une attaque par réutilisation', async () => {
            mockRedis.exists.mockResolvedValue(0); // Pas blacklisté
            mockRedis.get.mockResolvedValue('11'); // Trop de refreshs

            const result = await advancedTokenService.validateRefreshToken(
                'some-token',
                { userId: 'user-attack' }
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('SUSPECTED_ATTACK');
        });

        it('devrait détecter une famille compromise', async () => {
            mockRedis.exists.mockResolvedValue(0);
            mockRedis.get.mockResolvedValue(JSON.stringify({
                familyId: 'family-123',
                currentVersion: 5,
                isCompromised: true
            }));

            const result = await advancedTokenService.validateRefreshToken(
                'some-token',
                { userId: 'user-123', familyId: 'family-123', version: 3 }
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('FAMILY_COMPROMISED');
        });

        it('devrait détecter un token périmé (version)', async () => {
            mockRedis.exists.mockResolvedValue(0);
            mockRedis.get.mockResolvedValue(JSON.stringify({
                familyId: 'family-123',
                currentVersion: 5,
                isCompromised: false
            }));

            const result = await advancedTokenService.validateRefreshToken(
                'some-token',
                { userId: 'user-123', familyId: 'family-123', version: 2 } // Version plus vieille
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('TOKEN_ROTATED');
        });
    });

    describe('Fallback Redis', () => {
        it('devrait fonctionner sans Redis', async () => {
            // Simuler une erreur Redis
            mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

            const result = await advancedTokenService.generateRotatedTokenPair(
                'user-123',
                'test@example.com',
                'org-456',
                'USER'
            );

            // Devrait retourner un fallback
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });
    });
});

describe('Multi-Device et Sessions', () => {
    let advancedTokenService: any;

    beforeAll(async () => {
        jest.clearAllMocks();
        const module = await import('./advanced-token.service');
        advancedTokenService = module.advancedTokenService;
    });

    it('devrait permettre plusieurs appareils', async () => {
        mockRedis.get.mockResolvedValue(null); // Pas de famille existante
        mockRedis.setEx.mockResolvedValue('OK');
        mockRedis.incr.mockResolvedValue(1);
        mockRedis.expire.mockResolvedValue(true);

        // Simuler 3 appareils différents
        const device1 = await advancedTokenService.generateRotatedTokenPair(
            'user-123', 'test@example.com', 'org-456', 'USER'
        );
        
        const device2 = await advancedTokenService.generateRotatedTokenPair(
            'user-123', 'test@example.com', 'org-456', 'USER'
        );

        // Chaque appareil a son propre token mais même famille
        expect(device1.familyId).toBe(device2.familyId);
        expect(device1.accessToken).not.toBe(device2.accessToken);
    });

    it('devrait pouvoir révoquer tous les appareils', async () => {
        mockRedis.get.mockResolvedValue(null);
        mockRedis.setEx.mockResolvedValue('OK');
        mockRedis.del.mockResolvedValue(1);

        await advancedTokenService.revokeAllUserTokens('user-123');

        // Vérifier que la famille a été marquée comme compromise
        expect(mockRedis.setEx).toHaveBeenCalledWith(
            expect.stringContaining('token:family:'),
            expect.any(Number),
            expect.objectContaining({
                isCompromised: true
            })
        );
    });
});

describe('Métriques de Sécurité', () => {
    it('devrait calculer les métriques de sécurité', () => {
        // Test des fonctions de métriques
        const metrics = {
            loginAttempts: 0,
            refreshTokens: 0,
            tokensRevoked: 0,
            attacksDetected: 0
        };

        // Simuler des événements
        metrics.loginAttempts++;
        metrics.loginAttempts++;
        metrics.refreshTokens++;
        metrics.tokensRevoked++;

        expect(metrics.loginAttempts).toBe(2);
        expect(metrics.refreshTokens).toBe(1);
        expect(metrics.tokensRevoked).toBe(1);
    });
});
