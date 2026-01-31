import { ScraperEngine } from './src/scraping/engine/scraper.engine';
import { SourceType } from '@prisma/client';
import { ScraperConfig } from './src/scraping/types/scraping.types';

async function test() {
    console.log('🔍 Testing Scraper Engine...');
    const engine = new ScraperEngine();

    const testConfig: ScraperConfig = {
        name: 'Test Scraping',
        url: 'https://news.google.com/search?q=IA',
        type: SourceType.NEWS,
        selectors: {
            container: 'article',
            title: 'h3',
            content: 'time',
            author: 'div > div > div > a'
        }
    };

    try {
        console.log(`📡 Scraping ${testConfig.url}...`);
        const results = await engine.scrape(testConfig);
        console.log(`✅ Success! Found ${results.length} mentions.`);
        if (results.length > 0) {
            console.log('First result sample:', {
                title: results[0].title,
                content: results[0].content,
                url: results[0].url
            });
        }
    } catch (error) {
        console.error('❌ Scraping failed:', error);
    }
}

test();
