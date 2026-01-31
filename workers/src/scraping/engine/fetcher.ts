import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
// import { chromium, Browser, Page } from 'playwright'; // Optional: install if needed

export interface IFetcher {
    fetchHtml(url: string, headers?: Record<string, string>): Promise<string>;
}

export class CheerioFetcher implements IFetcher {
    private axiosInstance: AxiosInstance;

    constructor(timeout = 30000) {
        this.axiosInstance = axios.create({
            timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
            }
        });
    }

    async fetchHtml(url: string, headers?: Record<string, string>): Promise<string> {
        try {
            const response = await this.axiosInstance.get(url, { headers });
            return response.data;
        } catch (error) {
            console.error(`Error fetching HTML from ${url}:`, error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
}

/**
 * Placeholder for PlaywrightFetcher
 * Requires: npm install playwright
 */
export class PlaywrightFetcher implements IFetcher {
    async fetchHtml(url: string, headers?: Record<string, string>): Promise<string> {
        // Note: Implementation would require playwright dependency
        // For now, this is a conceptual implementation
        console.log(`[Dynamic Fetch] Fetching ${url} via Playwright...`);
        // Example logic:
        // const browser = await chromium.launch({ headless: true });
        // const context = await browser.newContext({ userAgent: '...' });
        // const page = await context.newPage();
        // await page.goto(url, { waitUntil: 'networkidle' });
        // const content = await page.content();
        // await browser.close();
        // return content;
        throw new Error('PlaywrightFetcher not fully implemented - install playwright first.');
    }
}
