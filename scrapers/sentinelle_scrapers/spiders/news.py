import scrapy
import json
import os
from datetime import datetime, timedelta
from base64 import b64encode
from sentinelle_scrapers.items import MentionItem

class NewsSpider(scrapy.Spider):
    name = "news"
    
    def __init__(self, keywords=None, source_id=None, language='en', max_pages=5, *args, **kwargs):
        super(NewsSpider, self).__init__(*args, **kwargs)
        self.api_key = os.getenv("NEWS_API_KEY")
        self.keywords = keywords
        self.source_id = source_id
        self.language = language
        self.max_pages = int(max_pages)
        self.current_page = 1
        
        if not self.api_key:
            self.logger.error("❌ NEWS_API_KEY not found in environment!")

    def start_requests(self):
        if not self.api_key or not self.keywords:
            return
        yield self.make_news_request(self.current_page)

    def make_news_request(self, page):
        # Prepare keywords for URL
        query = self.keywords.replace(",", " OR ")
        # Default: last 30 days
        from_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%dT%H:%M:%S')
        
        url = (
            f"https://newsapi.org/v2/everything?"
            f"q={query}&"
            f"language={self.language}&"
            f"from={from_date}&"
            f"sortBy=publishedAt&"
            f"pageSize=100&"
            f"page={page}&"
            f"apiKey={self.api_key}"
        )
        return scrapy.Request(url, callback=self.parse)

    def parse(self, response):
        data = json.loads(response.text)
        if data.get("status") != "ok":
            self.logger.error(f"NewsAPI error: {data.get('message')}")
            return

        articles = data.get("articles", [])
        
        for article in articles:
            url = article.get("url")
            external_id = f"news-{b64encode(url.encode()).decode()[:32]}"
            
            item = MentionItem()
            item['external_id'] = external_id
            item['source_id'] = self.source_id
            item['platform'] = "news"
            item['author'] = article.get('author') or article.get('source', {}).get('name') or 'Unknown'
            item['content'] = article.get('description', '') or article.get('title', '')
            item['rating'] = None  # News usually doesn't have a rating
            item['url'] = url
            
            item['published_at'] = article.get('publishedAt')
            item['scraped_at'] = datetime.now().isoformat()
            
            item['title'] = article.get('title')
            item['metadata'] = {
                "news_source": article.get('source', {}).get('name'),
                "description": article.get('description'),
                "url_to_image": article.get('urlToImage'),
                "full_content_snippet": article.get('content')
            }
            
            yield item

        # --- LOGIQUE DE PAGINATION (API) ---
        total_results = data.get("totalResults", 0)
        max_results_allowed = self.max_pages * 100
        
        if self.current_page * 100 < min(total_results, max_results_allowed):
            self.current_page += 1
            self.logger.info(f"⏭️  Recherche NewsAPI Page {self.current_page}...")
            yield self.make_news_request(self.current_page)
        else:
            self.logger.info("🏁 Fin de la collecte NewsAPI")
