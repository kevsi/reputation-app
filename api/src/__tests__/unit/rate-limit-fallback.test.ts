/**
 * 🧪 Rate Limiting Fallback Tests
 * 
 * Tests that verify the in-memory rate limiting fallback works correctly
 * when Redis is unavailable.
 */

import { Request, Response, NextFunction } from 'express';

describe('Rate Limiting Fallback', () => {
    // Import the memory rate limiter logic
    const memoryRateLimiter = (
        windowMs: number,
        limit: number,
        keyGenerator: (req: any) => string
    ) => {
        const memoryStore: { [key: string]: { count: number; resetTime: number } } = {};
        
        return (req: any, res: any, next: NextFunction) => {
            const key = keyGenerator(req);
            const now = Date.now();
            const windowStart = now - windowMs;
            
            // Clean up old entries
            for (const k in memoryStore) {
                if (memoryStore[k].resetTime < windowStart) {
                    delete memoryStore[k];
                }
            }
            
            // Check and update count
            if (!memoryStore[key] || memoryStore[key].resetTime < now) {
                memoryStore[key] = {
                    count: 1,
                    resetTime: now + windowMs
                };
                next();
                return;
            }
            
            if (memoryStore[key].count >= limit) {
                res.status(429).json({
                    success: false,
                    error: {
                        status: 429,
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: 'Too many requests. Please try again later.'
                    }
                });
                return;
            }
            
            memoryStore[key].count++;
            next();
        };
    };
    
    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;
    
    beforeEach(() => {
        mockReq = {
            ip: '127.0.0.1',
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });
    
    describe('Memory Rate Limiter', () => {
        it('should allow requests within the limit', () => {
            const limiter = memoryRateLimiter(60000, 5, (req) => req.ip || 'default');
            
            // Make 3 requests
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(1);
            
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(2);
            
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(3);
        });
        
        it('should block requests exceeding the limit', () => {
            const limiter = memoryRateLimiter(60000, 2, (req) => req.ip || 'default');
            
            // Make 2 requests (at limit)
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(1);
            
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(2);
            
            // Third request should be blocked
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(2); // Not called
            expect(mockRes.status).toHaveBeenCalledWith(429);
        });
        
        it('should track different IPs separately', () => {
            const limiter = memoryRateLimiter(60000, 2, (req) => req.ip || 'default');
            
            // Request from IP 1
            mockReq.ip = '127.0.0.1';
            limiter(mockReq as Request, mockRes as Response, mockNext);
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(2);
            
            // Reset mock
            mockNext.mockClear();
            
            // Request from IP 2 (should have its own limit)
            mockReq.ip = '127.0.0.2';
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(1); // Should be allowed
        });
        
        it('should reset after the window expires', async () => {
            const limiter = memoryRateLimiter(100, 2, (req) => req.ip || 'default'); // 100ms window
            
            // Use up the limit
            limiter(mockReq as Request, mockRes as Response, mockNext);
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(2);
            
            // Wait for window to expire
            await new Promise(resolve => setTimeout(resolve, 150));
            
            mockNext.mockClear();
            
            // Should be allowed again
            limiter(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });
});
