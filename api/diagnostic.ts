import { createApp } from './src/app';
import { getRedisClient } from './src/config/redis';
import { prisma } from './src/shared/database/prisma.client';

async function test() {
    try {
        console.log('1. Initializing Redis...');
        await getRedisClient();
        console.log('2. Creating App...');
        const app = createApp();
        console.log('3. Testing Prisma...');
        const userCount = await prisma.user.count();
        console.log('Prisma OK, user count:', userCount);
        console.log('ALL INFRASTRUCTURE OK');
        process.exit(0);
    } catch (error) {
        console.error('FAILURE:', error);
        process.exit(1);
    }
}

test();
