import { sourcesService } from './src/modules/sources/sources.service';
import { brandsService } from './src/modules/brands/brands.service';
import { getRedisClient } from './src/config/redis';
import { prisma } from './src/shared/database/prisma.client';
import { SourceType } from '@sentinelle/database';

async function test() {
    try {
        console.log('1. Initializing Redis...');
        await getRedisClient();

        console.log('2. Setting up test data...');
        const user = await prisma.user.create({
            data: {
                email: 'debug-' + Date.now() + '@example.com',
                password: 'password123',
                name: 'Debug User'
            }
        });

        const org = await prisma.organization.create({
            data: {
                name: 'Debug Org',
                slug: 'debug-org-' + Date.now(),
                ownerId: user.id
            }
        });

        const brand = await prisma.brand.create({
            data: {
                name: 'Debug Brand',
                organizationId: org.id,
                keywords: ['debug']
            }
        });

        console.log('3. Testing sourcesService.createSource...');
        const source = await sourcesService.createSource({
            brandId: brand.id,
            type: SourceType.NEWS,
            name: 'Debug Source',
            config: { url: 'https://news.google.com' }
        });

        console.log('✅ Source created:', source.id);

        console.log('4. Cleaning up...');
        await prisma.source.delete({ where: { id: source.id } });
        await prisma.brand.delete({ where: { id: brand.id } });
        await prisma.organization.delete({ where: { id: org.id } });
        await prisma.user.delete({ where: { id: user.id } });

        console.log('DONE');
        process.exit(0);
    } catch (error) {
        console.error('FAILURE:', error);
        process.exit(1);
    }
}

test();
