/**
 * 🧪 Security Headers Tests
 *
 * Tests that verify the security headers middleware:
 * - CSP (Content Security Policy) is properly set
 * - X-Frame-Options is set to DENY
 * - X-Content-Type-Options is set to nosniff
 * - HSTS is set in production
 */

import { securityHeaders } from '../../shared/middleware/security-headers.middleware';

describe('Security Headers Middleware', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockReq = {
            method: 'GET'
        };
        mockRes = {
            setHeader: jest.fn()
        };
        mockNext = jest.fn();
    });

    describe('Content Security Policy', () => {
        it('should set CSP header with script-src self', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            const cspCall = (mockRes.setHeader as jest.Mock).mock.calls.find(
                (call: any[]) => call[0] === 'Content-Security-Policy'
            );

            expect(cspCall).toBeDefined();
            expect(cspCall![1]).toContain("script-src 'self'");
        });

        it('should NOT allow unsafe-eval in CSP', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            const cspCall = (mockRes.setHeader as jest.Mock).mock.calls.find(
                (call: any[]) => call[0] === 'Content-Security-Policy'
            );

            expect(cspCall).toBeDefined();
            expect(cspCall![1]).not.toContain('unsafe-eval');
        });

        it('should allow WebSocket connections (wss:)', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            const cspCall = (mockRes.setHeader as jest.Mock).mock.calls.find(
                (call: any[]) => call[0] === 'Content-Security-Policy'
            );

            expect(cspCall).toBeDefined();
            expect(cspCall![1]).toContain('wss:');
        });

        it('should set frame-ancestors to none', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            const cspCall = (mockRes.setHeader as jest.Mock).mock.calls.find(
                (call: any[]) => call[0] === 'Content-Security-Policy'
            );

            expect(cspCall).toBeDefined();
            expect(cspCall![1]).toContain("frame-ancestors 'none'");
        });
    });

    describe('X-Frame-Options', () => {
        it('should set X-Frame-Options to DENY', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
        });
    });

    describe('X-Content-Type-Options', () => {
        it('should set X-Content-Type-Options to nosniff', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
        });
    });

    describe('X-XSS-Protection', () => {
        it('should set X-XSS-Protection to block mode', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
        });
    });

    describe('Referrer-Policy', () => {
        it('should set Referrer-Policy to strict-origin-when-cross-origin', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Referrer-Policy',
                'strict-origin-when-cross-origin'
            );
        });
    });

    describe('Permissions-Policy', () => {
        it('should restrict camera, microphone, geolocation, and payment', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Permissions-Policy',
                'camera=(), microphone=(), geolocation=(), payment=()'
            );
        });
    });

    describe('Cache Control', () => {
        it('should set no-cache headers for non-GET requests', () => {
            mockReq.method = 'POST';
            securityHeaders(mockReq, mockRes, mockNext);

            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Cache-Control',
                'no-store, no-cache, must-revalidate, proxy-revalidate'
            );
        });

        it('should not set cache headers for GET requests', () => {
            mockReq.method = 'GET';
            securityHeaders(mockReq, mockRes, mockNext);

            const cacheHeaderCalls = (mockRes.setHeader as jest.Mock).mock.calls.filter(
                (call: any[]) => call[0] === 'Cache-Control'
            );
            expect(cacheHeaderCalls.length).toBe(0);
        });
    });

    describe('HSTS', () => {
        const originalEnv = process.env.NODE_ENV;

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('should NOT set HSTS in development', () => {
            process.env.NODE_ENV = 'development';
            securityHeaders(mockReq, mockRes, mockNext);

            const hstsCalls = (mockRes.setHeader as jest.Mock).mock.calls.filter(
                (call: any[]) => call[0] === 'Strict-Transport-Security'
            );
            expect(hstsCalls.length).toBe(0);
        });

        it('should set HSTS in production', () => {
            process.env.NODE_ENV = 'production';
            securityHeaders(mockReq, mockRes, mockNext);

            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        });
    });

    describe('Next Function', () => {
        it('should call next()', () => {
            securityHeaders(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });
});
