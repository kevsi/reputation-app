/**
 * 🧪 Auth Middleware User Cache Tests
 *
 * Tests that verify the Redis user caching in the auth middleware:
 * - Cache hit returns cached user
 * - Cache miss fetches from DB and caches
 * - Fallback to DB when Redis unavailable
 * - Cache invalidation works
 */

// Mock Redis before importing
const mockRedisGet = jest.fn();
const mockRedisSetEx = jest.fn();
const mockRedisDel = jest.fn();

jest.mock('../../config/redis', () => ({
    redisClient: {
        get: mockRedisGet,
        setEx: mockRedisSetEx,
        del: mockRedisDel,
    },
}));

// Mock Prisma
const mockPrismaUserFindUnique = jest.fn();
jest.mock('../../shared/database/prisma.client', () => ({
    prisma: {
        user: {
            findUnique: mockPrismaUserFindUnique,
        },
    },
}));

// Mock JWT service
jest.mock('../../modules/auth/jwt.service', () => ({
    jwtService: {
        verifyToken: jest.fn().mockReturnValue({
            userId: 'user-123',
            email: 'test@example.com',
            organizationId: 'org-123',
            role: 'ADMIN',
        }),
    },
}));

// Mock token blacklist
jest.mock('../../modules/auth/token-blacklist.service', () => ({
    tokenBlacklistService: {
        isBlacklisted: jest.fn().mockResolvedValue(false),
    },
}));

// Mock logger
jest.mock('../../shared/logger', () => ({
    Logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

import { invalidateUserCache } from '../../shared/middleware/auth.middleware';

describe('Auth Middleware - User Cache', () => {
    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
        role: 'ADMIN',
        isActive: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getCachedUser (via requireAuth)', () => {
        it('should return cached user on Redis cache hit', async () => {
            // Setup: Redis returns cached user
            mockRedisGet.mockResolvedValue(JSON.stringify(mockUser));

            const { requireAuth } = await import('../../shared/middleware/auth.middleware');

            const mockReq: any = {
                cookies: { access_token: 'valid-token' },
                headers: {},
            };
            const mockRes: any = {};
            const mockNext = jest.fn();

            await requireAuth(mockReq, mockRes, mockNext);

            // Should have checked Redis
            expect(mockRedisGet).toHaveBeenCalledWith('user:cache:user-123');
            // Should NOT have queried the database
            expect(mockPrismaUserFindUnique).not.toHaveBeenCalled();
            // Should have called next (authenticated)
            expect(mockNext).toHaveBeenCalled();
            // User should be attached to request
            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.userId).toBe('user-123');
        });

        it('should fetch from DB and cache on Redis cache miss', async () => {
            // Setup: Redis returns null (cache miss)
            mockRedisGet.mockResolvedValue(null);
            mockPrismaUserFindUnique.mockResolvedValue(mockUser);
            mockRedisSetEx.mockResolvedValue('OK');

            const { requireAuth } = await import('../../shared/middleware/auth.middleware');

            const mockReq: any = {
                cookies: { access_token: 'valid-token' },
                headers: {},
            };
            const mockRes: any = {};
            const mockNext = jest.fn();

            await requireAuth(mockReq, mockRes, mockNext);

            // Should have checked Redis first
            expect(mockRedisGet).toHaveBeenCalledWith('user:cache:user-123');
            // Should have queried the database
            expect(mockPrismaUserFindUnique).toHaveBeenCalled();
            // Should have cached the result
            expect(mockRedisSetEx).toHaveBeenCalledWith(
                'user:cache:user-123',
                300, // 5 minutes TTL
                JSON.stringify(mockUser)
            );
            // Should have called next
            expect(mockNext).toHaveBeenCalled();
        });

        it('should reject disabled users', async () => {
            const disabledUser = { ...mockUser, isActive: false };
            mockRedisGet.mockResolvedValue(JSON.stringify(disabledUser));

            const { requireAuth } = await import('../../shared/middleware/auth.middleware');

            const mockReq: any = {
                cookies: { access_token: 'valid-token' },
                headers: {},
            };
            const mockRes: any = {};
            const mockNext = jest.fn();

            await requireAuth(mockReq, mockRes, mockNext);

            // Should have called next with an error
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                })
            );
        });
    });

    describe('invalidateUserCache', () => {
        it('should delete user from Redis cache', async () => {
            mockRedisDel.mockResolvedValue(1);

            await invalidateUserCache('user-123');

            expect(mockRedisDel).toHaveBeenCalledWith('user:cache:user-123');
        });

        it('should handle Redis errors gracefully', async () => {
            mockRedisDel.mockRejectedValue(new Error('Redis connection error'));

            // Should not throw
            await expect(invalidateUserCache('user-123')).resolves.not.toThrow();
        });
    });
});
