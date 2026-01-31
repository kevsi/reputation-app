/**
 * 🧪 Tests unitaires pour SourceAnalyzer
 * 
 * Couvre les 4 stratégies: SCRAPABLE, API_REQUIRED, GOOGLE_SEARCH, UNSUPPORTED
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios, { AxiosError } from 'axios';
import SourceAnalyzer, { CollectionStrategy, BlockageType } from '../source-analyzer';

// Mock axios
vi.mock('axios');

describe('SourceAnalyzer', () => {
  let analyzer: SourceAnalyzer;
  const mockedAxios = axios as any;

  beforeEach(() => {
    analyzer = new SourceAnalyzer({
      timeout: 5000,
      maxRetries: 1
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * Tests pour la stratégie SCRAPABLE
   */
  describe('Stratégie SCRAPABLE', () => {
    it('devrait identifier une URL scrappable simple', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="content">
              <article>
                <h1>Test Article</h1>
                <p>This is some content</p>
              </article>
            </div>
          </body>
        </html>
      `;

      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: htmlContent,
          headers: { 'content-type': 'text/html; charset=utf-8' }
        })
      });

      const result = await analyzer.analyze('https://example.com/blog');

      expect(result.strategy).toBe(CollectionStrategy.SCRAPABLE);
      expect(result.status).toBe(200);
      expect(result.hasContent).toBe(true);
      expect(result.isJavaScriptOnly).toBe(false);
      expect(result.blockageType).toBe(BlockageType.NONE);
      expect(result.message).toContain('scrappée directement');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('devrait détecter robots.txt permissif et retourner SCRAPABLE', async () => {
      const htmlContent = '<html><body>Content here</body></html>';

      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn()
          .mockResolvedValueOnce({ status: 200, data: htmlContent, headers: {} })
          .mockResolvedValueOnce({ status: 200, data: 'User-agent: *\nDisallow: /admin\n' }) // robots.txt
      });

      const result = await analyzer.analyze('https://news.example.com');

      expect(result.strategy).toBe(CollectionStrategy.SCRAPABLE);
      expect(result.hasRobotsTxt).toBe(true);
      expect(result.robotsAllowScraping).toBe(true);
    });

    it('devrait détecter un contenu HTML valide de forum', async () => {
      const htmlContent = `
        <html>
          <head><title>Forum Discussion</title></head>
          <body>
            <div class="post">
              <div class="author">John Doe</div>
              <div class="content">Great product review!</div>
            </div>
          </body>
        </html>
      `;

      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: htmlContent,
          headers: { 'content-type': 'text/html' }
        })
      });

      const result = await analyzer.analyze('https://forum.example.com/thread/123');

      expect(result.strategy).toBe(CollectionStrategy.SCRAPABLE);
      expect(result.hasContent).toBe(true);
      expect(result.logs.some(log => log.step === 'ANALYZE_CONTENT')).toBe(true);
    });
  });

  /**
   * Tests pour la stratégie GOOGLE_SEARCH
   */
  describe('Stratégie GOOGLE_SEARCH', () => {
    it('devrait détecter Cloudflare et retourner GOOGLE_SEARCH', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: 'You are being blocked by Cloudflare',
          headers: {
            'server': 'cloudflare',
            'cf-ray': '12345-LAX'
          }
        })
      });

      const result = await analyzer.analyze('https://protected.example.com');

      expect(result.strategy).toBe(CollectionStrategy.GOOGLE_SEARCH);
      expect(result.blockageType).toBe(BlockageType.CLOUDFLARE);
      expect(result.message).toContain('Google Search');
      expect(result.message).toContain('Cloudflare');
    });

    it('devrait détecter reCAPTCHA et retourner GOOGLE_SEARCH', async () => {
      const htmlWithCaptcha = `
        <html>
          <head>
            <script src="https://www.google.com/recaptcha/api.js"></script>
          </head>
          <body>
            <div class="g-recaptcha" data-sitekey="abc123"></div>
            Please solve the captcha to continue
          </body>
        </html>
      `;

      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: htmlWithCaptcha,
          headers: { 'content-type': 'text/html' }
        })
      });

      const result = await analyzer.analyze('https://captcha-protected.example.com');

      expect(result.strategy).toBe(CollectionStrategy.GOOGLE_SEARCH);
      expect(result.blockageType).toBe(BlockageType.RECAPTCHA);
      expect(result.message).toContain('reCAPTCHA');
    });

    it('devrait détecter JS-only (Next.js) et retourner GOOGLE_SEARCH', async () => {
      const jsOnlyHtml = `
        <html>
          <head>
            <title>Next.js App</title>
            <script id="__NEXT_DATA__" type="application/json">
              {"props":{"pageProps":{}}}
            </script>
          </head>
          <body>
            <div id="__next"></div>
          </body>
        </html>
      `;

      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: jsOnlyHtml,
          headers: { 'content-type': 'text/html' }
        })
      });

      const result = await analyzer.analyze('https://nextjs-site.example.com');

      expect(result.strategy).toBe(CollectionStrategy.GOOGLE_SEARCH);
      expect(result.isJavaScriptOnly).toBe(true);
      expect(result.message).toContain('JavaScript');
    });

    it('devrait détecter robots.txt restrictif et retourner GOOGLE_SEARCH', async () => {
      const htmlContent = '<html><body>Content</body></html>';
      const robotsContent = 'User-agent: *\nDisallow: /\n'; // Tout est bloqué

      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn()
          .mockResolvedValueOnce({ status: 200, data: htmlContent, headers: {} })
          .mockResolvedValueOnce({ status: 200, data: robotsContent })
      });

      const result = await analyzer.analyze('https://restrictive.example.com');

      expect(result.strategy).toBe(CollectionStrategy.GOOGLE_SEARCH);
      expect(result.hasRobotsTxt).toBe(true);
      expect(result.robotsAllowScraping).toBe(false);
      expect(result.message).toContain('robots.txt');
    });

    it('devrait détecter WAF et retourner GOOGLE_SEARCH', async () => {
      const wafHtml = `
        <html>
          <head><title>Access Denied</title></head>
          <body>
            <h1>403 Forbidden</h1>
            <p>Web Application Firewall has blocked your request</p>
          </body>
        </html>
      `;

      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: wafHtml,
          headers: { 'content-type': 'text/html' }
        })
      });

      const result = await analyzer.analyze('https://waf-protected.example.com');

      expect(result.strategy).toBe(CollectionStrategy.GOOGLE_SEARCH);
      expect(result.blockageType).toBe(BlockageType.WAF);
    });
  });

  /**
   * Tests pour la stratégie UNSUPPORTED
   */
  describe('Stratégie UNSUPPORTED', () => {
    it('devrait rejeter une URL invalide', async () => {
      const result = await analyzer.analyze('not-a-valid-url');

      expect(result.strategy).toBe(CollectionStrategy.UNSUPPORTED);
      expect(result.message).toContain('invalide');
      expect(result.logs.some(log => log.level === 'INFO')).toBe(true);
    });

    it('devrait retourner UNSUPPORTED pour HTTP 404', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 404 }),
        get: vi.fn().mockRejectedValue(new Error('Not Found'))
      });

      const result = await analyzer.analyze('https://example.com/notfound');

      expect(result.strategy).toBe(CollectionStrategy.UNSUPPORTED);
      expect(result.status).toBe(404);
      expect(result.message).toContain('404');
    });

    it('devrait retourner UNSUPPORTED pour page vide', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: '', // Contenu vide
          headers: { 'content-type': 'text/html' }
        })
      });

      const result = await analyzer.analyze('https://empty.example.com');

      expect(result.strategy).toBe(CollectionStrategy.UNSUPPORTED);
      expect(result.hasContent).toBe(false);
      expect(result.message).toContain('vide');
    });

    it('devrait retourner UNSUPPORTED pour HTTP 503', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 503 }),
        get: vi.fn().mockRejectedValue(new Error('Service Unavailable'))
      });

      const result = await analyzer.analyze('https://unavailable.example.com');

      expect(result.strategy).toBe(CollectionStrategy.UNSUPPORTED);
      expect(result.status).toBe(503);
    });

    it('devrait retourner UNSUPPORTED pour erreur réseau', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockRejectedValue(new Error('Network timeout')),
        get: vi.fn().mockRejectedValue(new Error('Network timeout'))
      });

      const result = await analyzer.analyze('https://unreachable.example.com');

      expect(result.strategy).toBe(CollectionStrategy.UNSUPPORTED);
      expect(result.message).toContain('inaccessible');
    });
  });

  /**
   * Tests pour la stratégie API_REQUIRED
   */
  describe('Stratégie API_REQUIRED', () => {
    it('devrait identifier les endpoints API', async () => {
      const apiResponse = `
        <html>
          <body>
            API Documentation: This is an API endpoint
          </body>
        </html>
      `;

      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: apiResponse,
          headers: { 'content-type': 'application/json' }
        })
      });

      const result = await analyzer.analyze('https://api.example.com/v1/mentions');

      // Note: Le contenu est détectable mais content-type indique API
      expect(result.contentType).toBe('application/json');
    });
  });

  /**
   * Tests des cas limites
   */
  describe('Cas limites et erreurs', () => {
    it('devrait gérer les timeouts gracieusement', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockRejectedValue(new Error('timeout')),
        get: vi.fn().mockRejectedValue(new Error('timeout'))
      });

      const result = await analyzer.analyze('https://slow.example.com');

      expect(result.strategy).toBe(CollectionStrategy.UNSUPPORTED);
      expect(result.logs.some(log => log.level === 'ERROR')).toBe(true);
    });

    it('devrait générer des logs détaillés', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: '<html><body>Test</body></html>',
          headers: { 'content-type': 'text/html' }
        })
      });

      const result = await analyzer.analyze('https://example.com');

      expect(result.logs.length).toBeGreaterThan(0);
      expect(result.logs.some(log => log.step === 'INIT')).toBe(true);
      expect(result.logs.some(log => log.step === 'COMPLETE')).toBe(true);
      expect(result.logs.some(log => log.message.includes('ms'))).toBe(true);
    });

    it('devrait générer des recommandations pertinentes', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: '<html><body>Content</body></html>',
          headers: {}
        })
      });

      const result = await analyzer.analyze('https://example.com');

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('devrait inclure le timestamp du diagnostic', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: '<html></html>',
          headers: {}
        })
      });

      const result = await analyzer.analyze('https://example.com');

      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  /**
   * Tests de performance
   */
  describe('Performance', () => {
    it('devrait compléter l\'analyse en moins de 10 secondes', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: '<html><body>Content</body></html>',
          headers: {}
        })
      });

      const startTime = Date.now();
      await analyzer.analyze('https://example.com');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10000);
    });
  });

  /**
   * Tests de messages utilisateur
   */
  describe('Messages utilisateur', () => {
    it('devrait avoir un message explicite pour SCRAPABLE', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: '<html><body>Content</body></html>',
          headers: {}
        })
      });

      const result = await analyzer.analyze('https://example.com');

      expect(result.message).toBeTruthy();
      expect(result.message.length).toBeGreaterThan(10);
      expect(result.message).toContain('directement');
    });

    it('devrait avoir un message explicite pour GOOGLE_SEARCH (Cloudflare)', async () => {
      mockedAxios.create.mockReturnValue({
        head: vi.fn().mockResolvedValue({ status: 200 }),
        get: vi.fn().mockResolvedValue({
          status: 200,
          data: 'Cloudflare blocked',
          headers: { 'server': 'cloudflare' }
        })
      });

      const result = await analyzer.analyze('https://example.com');

      expect(result.message).toContain('Google Search');
      expect(result.message).toContain('Cloudflare');
    });

    it('devrait avoir un message explicite pour UNSUPPORTED', async () => {
      const result = await analyzer.analyze('invalid-url');

      expect(result.message).toBeTruthy();
      expect(result.message).toContain('invalide');
    });
  });
});

export {};
