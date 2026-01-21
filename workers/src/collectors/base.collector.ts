import axios from 'axios';
import * as cheerio from 'cheerio';

export abstract class BaseCollector {
    protected axiosInstance = axios.create({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
    });

    abstract collect(url: string): Promise<any[]>;

    protected async fetchHtml(url: string): Promise<string> {
        const response = await this.axiosInstance.get(url);
        return response.data;
    }

    protected loadCheerio(html: string) {
        return cheerio.load(html);
    }
}
