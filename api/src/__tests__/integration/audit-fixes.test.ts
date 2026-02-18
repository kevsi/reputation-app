/**
 * 🧪 Integration Tests for Audit Fixes
 *
 * End-to-end tests that verify all audit recommendations
 * have been properly applied across the system.
 */

// Set required environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.API_VERSION = 'v1';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.ADMIN_URL = 'http://localhost:3001';
process.env.LANDING_URL = 'http://localhost:3002';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN = '7d';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-that-is-at-least-32-chars';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.EMAIL_FROM = 'test@example.com';
process.env.EMAIL_FROM_NAME = 'Test';
process.env.LOG_LEVEL = 'error';

// Mock dependencies that require external services
jest.mock('../../config/redis', () => ({
    redisClient: null,
    redisConnection: { host: 'localhost', port: 6379, password: undefined },
    getRedisClient: jest.fn().mockResolvedValue(null),
}));

// Mock BullMQ queues
jest.mock('bullmq', () => ({
    Queue: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        close: jest.fn(),
    })),
    QueueEvents: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        close: jest.fn(),
    })),
    Worker: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        close: jest.fn(),
    })),
}));

jest.mock('../../shared/database/prisma.client', () => ({
    prisma: {
        user: { findUnique: jest.fn(), findMany: jest.fn() },
        brand: { findMany: jest.fn() },
        mention: { findMany: jest.fn() },
        activityLog: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
        $disconnect: jest.fn(),
        $on: jest.fn(),
    },
}));

jest.mock('../../infrastructure/monitoring/prometheus', () => ({
    initMonitoring: jest.fn(),
}));

jest.mock('../../infrastructure/monitoring/auth-metrics', () => ({
    loginAttemptsTotal: { inc: jest.fn() },
}));

const passThrough = (_req: any, _res: any, next: any) => next();
jest.mock('../../shared/middleware/rate-limit.middleware', () => ({
    userRateLimiter: jest.fn(passThrough),
    authRateLimiter: jest.fn(passThrough),
    writeRateLimiter: jest.fn(passThrough),
    initializeRateLimiters: jest.fn(),
}));

jest.mock('../../shared/middleware/csrf.middleware', () => ({
    csrfProtection: jest.fn((_req: any, _res: any, next: any) => next()),
}));

jest.mock('../../shared/middleware/response-format.middleware', () => ({
    responseFormatter: jest.fn((_req: any, _res: any, next: any) => next()),
}));

jest.mock('../../modules/auth/token-blacklist.service', () => ({
    tokenBlacklistService: {
        isBlacklisted: jest.fn().mockResolvedValue(false),
    },
}));

import { createApp } from '../../app';
import request from 'supertest';
import { Application } from 'express';

describe('Audit Fixes - Integration Tests', () => {
    let app: Application;

    beforeAll(() => {
        app = createApp();
    });

    describe('Health Check', () => {
        it('should return 200 on /health', async () => {
            const res = await request(app).get('/health');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.timestamp).toBeDefined();
            expect(res.body.uptime).toBeDefined();
        });
    });

    describe('Security Headers', () => {
        it('should include X-Frame-Options: DENY', async () => {
            const res = await request(app).get('/health');

            expect(res.headers['x-frame-options']).toBe('DENY');
        });

        it('should include X-Content-Type-Options: nosniff', async () => {
            const res = await request(app).get('/health');

            expect(res.headers['x-content-type-options']).toBe('nosniff');
        });

        it('should include X-XSS-Protection', async () => {
            const res = await request(app).get('/health');

            expect(res.headers['x-xss-protection']).toBe('1; mode=block');
        });

        it('should include Content-Security-Policy without unsafe-eval', async () => {
            const res = await request(app).get('/health');

            const csp = res.headers['content-security-policy'];
            expect(csp).toBeDefined();
            expect(csp).not.toContain('unsafe-eval');
            expect(csp).toContain("script-src 'self'");
        });

        it('should include Referrer-Policy', async () => {
            const res = await request(app).get('/health');

            expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        });

        it('should include Permissions-Policy', async () => {
            const res = await request(app).get('/health');

            expect(res.headers['permissions-policy']).toContain('camera=()');
        });
    });

    describe('Demo Endpoints Protection', () => {
        it('should NOT expose demo endpoints in test/production', async () => {
            // In test mode (not development), demo endpoints should not exist
            const mentionsRes = await request(app).get('/demo/mentions');
            const brandsRes = await request(app).get('/demo/brands');

            // Should return 404 (not found) since we're not in development
            expect(mentionsRes.status).toBe(404);
            expect(brandsRes.status).toBe(404);
        });
    });

    describe('404 Handler', () => {
        it('should return structured 404 for unknown routes', async () => {
            const res = await request(app).get('/api/v1/nonexistent');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBeDefined();
            expect(res.body.error.code).toBe('NOT_FOUND');
        });
    });

    describe('API Root', () => {
        it('should return API info on /api/v1', async () => {
            const res = await request(app).get('/api/v1');

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('Sentinelle');
            expect(res.body.status).toBe('running');
        });
    });

    describe('Error Response Format', () => {
        it('should return consistent error format', async () => {
            const res = await request(app).get('/api/v1/nonexistent');

            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toHaveProperty('code');
            expect(res.body.error).toHaveProperty('message');
        });
    });
});
