/**
 * 🔐 JWT Secret Validation Tests
 *
 * Tests that verify JWT secret validation at startup:
 * - Secrets must be at least 32 characters
 * - Secrets must be different
 * - Application should fail fast if misconfigured
 */

// Base valid environment for all tests
const validEnv: Record<string, string> = {
    NODE_ENV: 'test',
    PORT: '5001',
    API_VERSION: 'v1',
    CLIENT_URL: 'http://localhost:3000',
    ADMIN_URL: 'http://localhost:3001',
    LANDING_URL: 'http://localhost:3002',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    JWT_SECRET: 'a-valid-jwt-secret-that-is-at-least-32-characters-long',
    JWT_EXPIRES_IN: '7d',
    JWT_REFRESH_SECRET: 'a-different-refresh-secret-that-is-at-least-32-chars',
    JWT_REFRESH_EXPIRES_IN: '30d',
    EMAIL_FROM: 'test@example.com',
    EMAIL_FROM_NAME: 'Test',
    LOG_LEVEL: 'error',
};

describe('JWT Secret Validation', () => {
    const originalEnv = process.env;
    let mockExit: jest.SpyInstance;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...validEnv };
        // Mock process.exit to prevent test runner from dying
        mockExit = jest.spyOn(process, 'exit').mockImplementation((() => {
            throw new Error('process.exit called');
        }) as any);
    });

    afterEach(() => {
        mockExit.mockRestore();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Startup Validation via Zod schema', () => {
        it('should reject JWT_SECRET shorter than 32 characters', () => {
            process.env.JWT_SECRET = 'short';

            expect(() => {
                require('../../config/app');
            }).toThrow();
        });

        it('should reject JWT_REFRESH_SECRET shorter than 32 characters', () => {
            process.env.JWT_REFRESH_SECRET = 'short';

            expect(() => {
                require('../../config/app');
            }).toThrow();
        });

        it('should accept valid secrets (32+ characters)', () => {
            // All env vars are valid in validEnv
            expect(() => {
                require('../../config/app');
            }).not.toThrow();
        });
    });

    describe('JwtService Constructor Validation', () => {
        it('should throw if JWT_SECRET equals JWT_REFRESH_SECRET', () => {
            const sameSecret = 'a-very-long-secret-that-is-at-least-32-characters-long';
            process.env.JWT_SECRET = sameSecret;
            process.env.JWT_REFRESH_SECRET = sameSecret;

            expect(() => {
                require('../../modules/auth/jwt.service');
            }).toThrow('CRITICAL SECURITY ERROR');
        });

        it('should create JwtService with valid different secrets', () => {
            expect(() => {
                const mod = require('../../modules/auth/jwt.service');
                expect(mod.jwtService).toBeDefined();
            }).not.toThrow();
        });

        it('should generate valid access tokens', () => {
            const { jwtService } = require('../../modules/auth/jwt.service');

            const token = jwtService.generateAccessToken({
                userId: 'test-user',
                email: 'test@example.com',
                organizationId: 'org-123',
                role: 'ADMIN',
            });

            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
        });

        it('should generate valid refresh tokens', () => {
            const { jwtService } = require('../../modules/auth/jwt.service');

            const token = jwtService.generateRefreshToken({
                userId: 'test-user',
                email: 'test@example.com',
                organizationId: 'org-123',
                role: 'ADMIN',
            });

            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);
        });

        it('should verify a valid access token', () => {
            const { jwtService } = require('../../modules/auth/jwt.service');

            const payload = {
                userId: 'test-user',
                email: 'test@example.com',
                organizationId: 'org-123',
                role: 'ADMIN',
            };

            const token = jwtService.generateAccessToken(payload);
            const decoded = jwtService.verifyToken(token);

            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });

        it('should reject a tampered token', () => {
            const { jwtService } = require('../../modules/auth/jwt.service');

            const token = jwtService.generateAccessToken({
                userId: 'test-user',
                email: 'test@example.com',
                organizationId: 'org-123',
                role: 'ADMIN',
            });

            // Tamper with the token
            const tamperedToken = token.slice(0, -5) + 'XXXXX';

            expect(() => {
                jwtService.verifyToken(tamperedToken);
            }).toThrow();
        });

        it('should use different secrets for access and refresh tokens', () => {
            const { jwtService } = require('../../modules/auth/jwt.service');

            const payload = {
                userId: 'test-user',
                email: 'test@example.com',
                organizationId: 'org-123',
                role: 'ADMIN',
            };

            const accessToken = jwtService.generateAccessToken(payload);
            const refreshToken = jwtService.generateRefreshToken(payload);

            // Access token should NOT be verifiable as refresh token
            expect(() => {
                jwtService.verifyRefreshToken(accessToken);
            }).toThrow();

            // Refresh token should NOT be verifiable as access token
            expect(() => {
                jwtService.verifyToken(refreshToken);
            }).toThrow();
        });
    });
});
