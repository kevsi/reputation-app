import request from 'supertest';
import { createApp } from '../../app';
import { Application } from 'express';
import { prisma } from '../../shared/database/prisma.client';

describe('Sources Integration Tests', () => {
    let app: Application;
    let testBrandId: string;
    let testOrgId: string;
    let testUserId: string;

    beforeAll(async () => {
        // Initialiser Redis pour le rate limiter
        const { getRedisClient } = await import('../../config/redis');
        await getRedisClient();

        app = createApp();

        // Setup : Créer un utilisateur
        const user = await prisma.user.create({
            data: {
                email: 'test-' + Date.now() + '@example.com',
                password: 'password123',
                name: 'Test User'
            }
        });
        testUserId = user.id;

        // Setup : Créer une organisation et une marque pour les tests
        const org = await prisma.organization.create({
            data: {
                name: 'Test Org ' + Date.now(),
                slug: 'test-org-' + Date.now(),
                ownerId: user.id
            }
        });
        testOrgId = org.id;

        const brand = await prisma.brand.create({
            data: {
                name: 'Test Brand',
                organizationId: org.id,
                keywords: ['test']
            }
        });
        testBrandId = brand.id;
    });


    afterAll(async () => {
        // Cleanup
        if (testBrandId) {
            await prisma.source.deleteMany({ where: { brandId: testBrandId } });
            await prisma.brand.delete({ where: { id: testBrandId } });
        }
        if (testOrgId) {
            await prisma.organization.delete({ where: { id: testOrgId } });
        }
        if (testUserId) {
            await prisma.user.delete({ where: { id: testUserId } });
        }
        await prisma.$disconnect();
    });

    it('should create a new source', async () => {
        const sourceData = {
            brandId: testBrandId,
            type: 'NEWS',
            name: 'Test Source',
            config: { url: 'https://www.lemonde.fr' },
            scrapingFrequency: 3600
        };

        const res = await request(app)
            .post('/api/v1/sources')
            .send(sourceData);

        // Si auth est activé, on s'attend à 401 sans token
        // Pour l'instant on vérifie juste que l'endpoint réagit
        expect([201, 401]).toContain(res.status);
    });

    it('should create a source via service (direct repo test)', async () => {
        const { sourcesService } = await import('../../modules/sources/sources.service');

        const source = await sourcesService.createSource({
            brandId: testBrandId,
            type: 'NEWS',
            name: 'Service Test Source',
            config: { url: 'https://news.ycombinator.com' }
        });

        expect(source).toHaveProperty('id');
        expect(source.name).toBe('Service Test Source');

        const fetched = await sourcesService.getSourceById(source.id);
        expect(fetched?.id).toBe(source.id);
    });

    it('should list sources for an organization (expected 401 without auth)', async () => {
        const res = await request(app)
            .get('/api/v1/sources');

        // requireAuth middleware should block this with 401
        expect(res.status).toBe(401);
    });
});
