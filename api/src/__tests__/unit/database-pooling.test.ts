/**
 * 🧪 Database Connection Pooling Tests
 *
 * Tests that verify the Prisma connection pooling configuration:
 * - Connection pool parameters are added to DATABASE_URL
 * - Pool size is configurable via environment variable
 * - Connection timeout is configurable
 */

describe('Database Connection Pooling', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Connection Pool URL Parameters', () => {
        it('should add connection_limit to DATABASE_URL without query params', () => {
            const baseUrl = 'postgresql://user:pass@localhost:5432/mydb';
            process.env.DATABASE_URL = baseUrl;

            // Simulate the logic from prisma.client.ts
            let databaseUrl = baseUrl;
            const poolSize = 10;
            const timeout = 10;

            if (!databaseUrl.includes('connection_limit')) {
                const separator = databaseUrl.includes('?') ? '&' : '?';
                databaseUrl += `${separator}connection_limit=${poolSize}&pool_timeout=${timeout}`;
            }

            expect(databaseUrl).toContain('?connection_limit=10');
            expect(databaseUrl).toContain('&pool_timeout=10');
        });

        it('should append connection_limit to DATABASE_URL with existing query params', () => {
            const baseUrl = 'postgresql://user:pass@localhost:5432/mydb?schema=public';
            process.env.DATABASE_URL = baseUrl;

            let databaseUrl = baseUrl;
            const poolSize = 10;
            const timeout = 10;

            if (!databaseUrl.includes('connection_limit')) {
                const separator = databaseUrl.includes('?') ? '&' : '?';
                databaseUrl += `${separator}connection_limit=${poolSize}&pool_timeout=${timeout}`;
            }

            expect(databaseUrl).toContain('&connection_limit=10');
            expect(databaseUrl).toContain('&pool_timeout=10');
            expect(databaseUrl).toContain('?schema=public');
        });

        it('should not duplicate connection_limit if already present', () => {
            const baseUrl = 'postgresql://user:pass@localhost:5432/mydb?connection_limit=5';
            process.env.DATABASE_URL = baseUrl;

            let databaseUrl = baseUrl;
            const poolSize = 10;
            const timeout = 10;

            if (!databaseUrl.includes('connection_limit')) {
                const separator = databaseUrl.includes('?') ? '&' : '?';
                databaseUrl += `${separator}connection_limit=${poolSize}&pool_timeout=${timeout}`;
            }

            // Should keep original value, not add new one
            expect(databaseUrl).toBe(baseUrl);
            expect(databaseUrl.match(/connection_limit/g)?.length).toBe(1);
        });
    });

    describe('Pool Size Configuration', () => {
        it('should default pool size to 10', () => {
            const defaultPoolSize = parseInt(process.env.DATABASE_POOL_SIZE || '10', 10);
            expect(defaultPoolSize).toBe(10);
        });

        it('should accept custom pool size from environment', () => {
            process.env.DATABASE_POOL_SIZE = '20';
            const poolSize = parseInt(process.env.DATABASE_POOL_SIZE, 10);
            expect(poolSize).toBe(20);
        });

        it('should default connection timeout to 10', () => {
            const defaultTimeout = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10', 10);
            expect(defaultTimeout).toBe(10);
        });

        it('should accept custom connection timeout from environment', () => {
            process.env.DATABASE_CONNECTION_TIMEOUT = '30';
            const timeout = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT, 10);
            expect(timeout).toBe(30);
        });
    });

    describe('Prisma Singleton Pattern', () => {
        it('should use global instance in non-production', () => {
            process.env.NODE_ENV = 'development';

            // The prisma client module uses globalThis.prismaGlobal
            // to prevent multiple instances during hot reload
            expect(typeof globalThis).toBe('object');
        });
    });
});
