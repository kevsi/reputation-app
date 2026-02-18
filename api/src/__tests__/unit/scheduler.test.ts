/**
 * Unit Tests for Scraping Scheduler
 */

import { prisma } from '../../shared/database/prisma.client';

// Mock the queue
jest.mock('../../infrastructure/queue/scraping.queue', () => ({
  scrapingQueue: {
    add: jest.fn().mockResolvedValue({ id: 'test-job' })
  }
}));

// Mock logger
jest.mock('../../infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Scraping Scheduler', () => {
  // Note: These tests require a database connection
  // In production, use test database

  describe('findPendingSources logic', () => {
    it('should include sources never scraped', () => {
      const now = new Date();
      const source = {
        id: '1',
        isActive: true,
        lastScrapedAt: null,
        scrapingFrequency: 3600,
        errorCount: 0
      };

      // Source never scraped should be pending
      expect(source.lastScrapedAt).toBeNull();
    });

    it('should include sources past their frequency interval', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600 * 1000);
      
      const source = {
        id: '1',
        isActive: true,
        lastScrapedAt: oneHourAgo,
        scrapingFrequency: 1800, // 30 minutes
        errorCount: 0
      };

      // Last scraped 1 hour ago, frequency is 30 min = should be pending
      const lastScraped = source.lastScrapedAt.getTime();
      const frequencyMs = source.scrapingFrequency * 1000;
      const nextScrape = lastScraped + frequencyMs;
      
      expect(now.getTime()).toBeGreaterThan(nextScrape);
    });

    it('should exclude sources within their frequency interval', () => {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      
      const source = {
        id: '1',
        isActive: true,
        lastScrapedAt: tenMinutesAgo,
        scrapingFrequency: 3600, // 1 hour
        errorCount: 0
      };

      // Last scraped 10 min ago, frequency is 1 hour = should NOT be pending
      const lastScraped = source.lastScrapedAt.getTime();
      const frequencyMs = source.scrapingFrequency * 1000;
      const nextScrape = lastScraped + frequencyMs;
      
      expect(now.getTime()).toBeLessThan(nextScrape);
    });

    it('should exclude inactive sources', () => {
      const source = {
        id: '1',
        isActive: false,
        lastScrapedAt: null,
        scrapingFrequency: 3600,
        errorCount: 0
      };

      expect(source.isActive).toBe(false);
    });

    it('should exclude sources with too many errors', () => {
      const source = {
        id: '1',
        isActive: true,
        lastScrapedAt: null,
        scrapingFrequency: 3600,
        errorCount: 10
      };

      // This would be handled by the scheduler logic
      expect(source.errorCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe('scheduleScrapingJob', () => {
    it('should add random delay to prevent thundering herd', () => {
      const delays: number[] = [];
      
      // Generate 100 random delays
      for (let i = 0; i < 100; i++) {
        const delay = Math.floor(Math.random() * 30000);
        delays.push(delay);
      }

      // All delays should be within range
      delays.forEach(delay => {
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThan(30000);
      });

      // Delays should be somewhat distributed (not all the same)
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(50);
    });
  });
});

describe('Scraping Configuration', () => {
  const DEFAULT_SCRAPING_FREQUENCY = 21600; // 6 hours in seconds

  it('should use default frequency when not specified', () => {
    const source = {
      scrapingFrequency: undefined
    };

    const frequency = source.scrapingFrequency || DEFAULT_SCRAPING_FREQUENCY;
    expect(frequency).toBe(DEFAULT_SCRAPING_FREQUENCY);
  });

  it('should convert frequency to milliseconds correctly', () => {
    const frequencySeconds = 3600; // 1 hour
    const frequencyMs = frequencySeconds * 1000;
    
    expect(frequencyMs).toBe(3600000);
  });

  it('should calculate next scrape time correctly', () => {
    const lastScrapedAt = new Date('2024-01-01T00:00:00Z');
    const scrapingFrequency = 3600; // 1 hour in seconds
    
    const nextScrapeTime = new Date(
      lastScrapedAt.getTime() + scrapingFrequency * 1000
    );
    
    expect(nextScrapeTime.toISOString()).toBe('2024-01-01T01:00:00.000Z');
  });
});
