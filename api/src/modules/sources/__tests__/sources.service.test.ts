// @ts-nocheck
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SourcesService } from '../sources.service';
import { AppError } from '@/shared/utils/errors';

const mockRepository: {
  findByBrandId: ReturnType<typeof jest.fn>;
  findById: ReturnType<typeof jest.fn>;
  create: ReturnType<typeof jest.fn>;
  update: ReturnType<typeof jest.fn>;
  updateScrapingStatus: ReturnType<typeof jest.fn>;
  findPendingSources: ReturnType<typeof jest.fn>;
} = {
  findByBrandId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateScrapingStatus: jest.fn(),
  findPendingSources: jest.fn(),
};

jest.mock('../sources.repository', () => ({
  SourcesRepository: jest.fn(() => mockRepository),
}));
jest.mock('@/infrastructure/queue/scraping.queue', () => ({
  scrapingQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job-123' } as { id: string }),
  },
}));
jest.mock('@/shared/database/prisma.client', () => ({
  prisma: {
    brand: {
      findUnique: jest.fn(),
    },
  },
}));

const prisma = require('@/shared/database/prisma.client').prisma;

describe('SourcesService', () => {
  let service: SourcesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SourcesService();
  });

  describe('create()', () => {
    it('should create Google Reviews source with valid config', async () => {
      prisma.brand.findUnique.mockResolvedValue({
        id: 'brand_123',
        organizationId: 'org_123',
        organization: { subscription: { plan: 'PRO' } },
        sources: [],
      });

      mockRepository.create.mockResolvedValue({
        id: 'source_123',
        type: 'GOOGLE_REVIEWS',
        brandId: 'brand_123',
        name: 'Mon Restaurant',
        config: { placeId: 'ChIJ...', googleApiKey: 'AIza...' },
        isActive: true,
        scrapingFrequency: 86400,
        lastScrapedAt: null,
        errorCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockRepository.findById.mockResolvedValue({
        id: 'source_123',
        brandId: 'brand_123',
        type: 'GOOGLE_REVIEWS',
        config: {},
      } as any);

      const data = {
        type: 'GOOGLE_REVIEWS' as const,
        name: 'Mon Restaurant',
        config: {
          placeId: 'ChIJ123',
          googleApiKey: 'AIzaSy123',
        },
        scrapingFrequency: 'DAILY' as const,
      };

      const source = await service.create('user_123', 'brand_123', data);

      expect(source).toBeDefined();
      expect(source.type).toBe('GOOGLE_REVIEWS');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should reject invalid Google Reviews config (missing placeId)', async () => {
      prisma.brand.findUnique.mockResolvedValue({
        id: 'brand_123',
        organizationId: 'org_123',
        organization: { subscription: { plan: 'FREE' } },
        sources: [],
      });

      const data = {
        type: 'GOOGLE_REVIEWS' as const,
        name: 'Mon Restaurant',
        config: {
          googleApiKey: 'AIzaSy123',
        },
      };

      await expect(
        service.create('user_123', 'brand_123', data)
      ).rejects.toThrow(AppError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject when plan limit reached', async () => {
      prisma.brand.findUnique.mockResolvedValue({
        id: 'brand_123',
        organizationId: 'org_123',
        organization: { subscription: { plan: 'FREE' } },
        sources: [{ id: '1' }, { id: '2' }, { id: '3' }],
      });

      const data = {
        type: 'RSS' as const,
        name: 'Mon Flux',
        config: { feedUrl: 'https://example.com/feed.xml' },
      };

      await expect(
        service.create('user_123', 'brand_123', data)
      ).rejects.toThrow('Limite de sources atteinte');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create Trustpilot source with valid config', async () => {
      prisma.brand.findUnique.mockResolvedValue({
        id: 'brand_123',
        organizationId: 'org_123',
        organization: { subscription: { plan: 'STARTER' } },
        sources: [],
      });

      mockRepository.create.mockResolvedValue({
        id: 'source_123',
        type: 'TRUSTPILOT',
        brandId: 'brand_123',
        name: 'Ma Société',
        config: { companyUrl: 'https://www.trustpilot.com/review/example.com' },
        isActive: true,
        scrapingFrequency: 86400,
        lastScrapedAt: null,
        errorCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockRepository.findById.mockResolvedValue({
        id: 'source_123',
        brandId: 'brand_123',
        type: 'TRUSTPILOT',
        config: {},
      } as any);

      const data = {
        type: 'TRUSTPILOT' as const,
        name: 'Ma Société',
        config: { companyUrl: 'https://www.trustpilot.com/review/example.com' },
      };

      const source = await service.create('user_123', 'brand_123', data);

      expect(source.type).toBe('TRUSTPILOT');
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('getByBrandId()', () => {
    it('should return sources for a brand', async () => {
      const mockSources = [
        { id: '1', name: 'Source 1', brandId: 'brand_123' },
        { id: '2', name: 'Source 2', brandId: 'brand_123' },
      ];
      mockRepository.findByBrandId.mockResolvedValue(mockSources as any);

      const result = await service.getByBrandId('brand_123');

      expect(result).toEqual(mockSources);
      expect(mockRepository.findByBrandId).toHaveBeenCalledWith('brand_123');
    });
  });

  describe('getById()', () => {
    it('should return a source by ID', async () => {
      const mockSource = { id: 'source_123', name: 'Ma Source', brandId: 'brand_123' };
      mockRepository.findById.mockResolvedValue(mockSource as any);

      const result = await service.getById('source_123');

      expect(result).toEqual(mockSource);
      expect(mockRepository.findById).toHaveBeenCalledWith('source_123');
    });
  });

  describe('update()', () => {
    it('should update a source', async () => {
      const existingSource = {
        id: 'source_123',
        type: 'RSS',
        name: 'Mon Flux',
        config: { feedUrl: 'https://example.com/feed.xml' },
      };
      mockRepository.findById.mockResolvedValue(existingSource as any);
      mockRepository.update.mockResolvedValue({
        ...existingSource,
        name: 'Mon Flux Mis à Jour',
      } as any);

      const result = await service.update('source_123', {
        name: 'Mon Flux Mis à Jour',
      });

      expect(result.name).toBe('Mon Flux Mis à Jour');
      expect(mockRepository.update).toHaveBeenCalledWith('source_123', expect.any(Object));
    });

    it('should throw when source not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('invalid_id', { name: 'Test' })
      ).rejects.toThrow('Source non trouvée');
    });
  });

  describe('delete()', () => {
    it('should soft delete a source', async () => {
      mockRepository.update.mockResolvedValue({
        id: 'source_123',
        isActive: false,
      } as any);

      await service.delete('source_123');

      expect(mockRepository.update).toHaveBeenCalledWith('source_123', { isActive: false });
    });
  });

  describe('updateStatus()', () => {
    it('should update source status to PAUSED', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'source_123',
        isActive: true,
      } as any);
      mockRepository.update.mockResolvedValue({
        id: 'source_123',
        isActive: false,
      } as any);

      await service.updateStatus('source_123', 'PAUSED');

      expect(mockRepository.update).toHaveBeenCalledWith('source_123', { isActive: false });
    });

    it('should throw when source not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('invalid_id', 'ACTIVE')
      ).rejects.toThrow('Source non trouvée');
    });
  });

  describe('triggerScraping()', () => {
    it('should add job to queue and return jobId', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'source_123',
        brandId: 'brand_123',
        type: 'RSS',
        config: { feedUrl: 'https://example.com/feed.xml' },
        isActive: true,
      } as any);

      const scrapingQueue = require('@/infrastructure/queue/scraping.queue').scrapingQueue;

      const result = await service.triggerScraping('source_123');

      expect(result.jobId).toBe('job-123');
      expect(scrapingQueue.add).toHaveBeenCalledWith(
        'scrape-source',
        expect.objectContaining({
          sourceId: 'source_123',
          brandId: 'brand_123',
          type: 'RSS',
        }),
        expect.any(Object)
      );
    });

    it('should throw when source is inactive', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'source_123',
        isActive: false,
      } as any);

      await expect(
        service.triggerScraping('source_123')
      ).rejects.toThrow('La source doit être active pour lancer un scraping');
    });
  });
});
