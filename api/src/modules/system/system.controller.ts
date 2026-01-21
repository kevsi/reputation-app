
import { Request, Response } from 'express';
import { prisma } from '../../shared/database/prisma.client';
import { getRedisClient } from '../../config/redis';
import { config } from '../../config/app';

export class SystemController {

    /**
     * Helper to run a promise with a timeout
     */
    private withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
        return Promise.race([
            promise,
            new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
        ]);
    }

    /**
     * Get overall system status (DB, Redis, AI Service, Workers)
     */
    async getStatus(_req: Request, res: Response) {
        const status: any = {
            database: 'unknown',
            redis: 'unknown',
            aiService: 'unknown',
            workers: 'unknown',
            timestamp: new Date().toISOString()
        };

        // 1. Check Database (Prisma)
        try {
            await this.withTimeout(prisma.$queryRaw`SELECT 1`, 2000, null);
            status.database = 'connected';
        } catch (error) {
            status.database = 'disconnected';
            console.error('Database Check Error:', error);
        }

        // 2. Check Redis
        try {
            const redis = await this.withTimeout(getRedisClient(), 2000, null);
            if (redis && redis.isOpen) {
                await this.withTimeout(redis.ping(), 1000, 'PONG');
                status.redis = 'connected';
            } else {
                status.redis = 'disconnected';
            }
        } catch (error) {
            status.redis = 'disconnected';
            console.error('Redis Check Error:', error);
        }

        // 3. Check AI Service - Using native fetch (Node 18+)
        try {
            const aiUrl = config.AI_SERVICE_URL;
            const response = await fetch(`${aiUrl}/health`, {
                signal: AbortSignal.timeout(2000)
            } as any);

            if (response.ok) {
                status.aiService = 'operational';
                status.aiDetails = await response.json();
            } else {
                status.aiService = 'degraded';
            }
        } catch (error) {
            status.aiService = 'unreachable';
            console.error('AI Service Check Error:', error);
        }

        // 4. Check Workers
        if (status.redis === 'connected') {
            status.workers = 'operational';
        } else {
            status.workers = 'unknown';
        }

        res.json({
            success: true,
            data: status
        });
    }
}

export const systemController = new SystemController();
