import scrapy
from datetime import datetime
from sentinelle_scrapers.items import MentionItem

class TrustpilotSpider(scrapy.Spider):
    name = "trustpilot"
    allowed_domains = ["trustpilot.com"]

    def __init__(self, company_name=None, source_id=None, keywords=None, *args, **kwargs):
        super(TrustpilotSpider, self).__init__(*args, **kwargs)
        self.company_name = company_name
        self.source_id = source_id
        self.keywords = keywords.split(",") if keywords else []
        self.start_urls = [f"https://www.trustpilot.com/review/{company_name}"]

    def parse(self, response):
        """
        Parses the Trustpilot review page
        """
        # Select all review cards
        reviews = response.css('[data-review-id]')
        
        for review in reviews:
            review_id = review.attrib.get('data-review-id')
            
            # Extract content
            text = review.css('.review-content-header__body::text').get() or \
                   review.css('p::text').get()
            
            if not text:
                continue
                
            author = review.css('.consumer-info__name::text').get() or 'Anonymous'
            rating = review.css('.star-rating').attrib.get('data-rating')
            date_str = review.css('time').attrib.get('datetime')
            
            text = text.strip()
            
            # Keyword filter (optional, as in original code)
            if self.keywords:
                if not any(kw.lower() in text.lower() for kw in self.keywords):
                    continue

            item = MentionItem()
            item['external_id'] = review_id
            item['source_id'] = self.source_id
            item['platform'] = "trustpilot"
            item['author'] = author.strip()
            item['content'] = text
            item['rating'] = int(rating) if rating else None
            item['url'] = f"{response.url}#{review_id}"
            
            # Use ISO format for dates
            item['published_at'] = date_str
            item['scraped_at'] = datetime.now().isoformat()
            
            item['metadata'] = {
                "company_name": self.company_name,
                "review_id": review_id
            }
            
            yield item

        # --- LOGIQUE DE PAGINATION ---
        # On cherche le lien vers la page suivante (bouton "Next")
        # Le sélecteur 'a[name="pagination-button-next"]' est standard sur Trustpilot
        next_page = response.css('a[name="pagination-button-next"]::attr(href)').get()
        
        if next_page:
            self.logger.info(f"⏭️  Saut vers la page suivante : {next_page}")
            # On suit le lien et on rappelle la méthode parse pour traiter la nouvelle page
            yield response.follow(next_page, callback=self.parse)
        else:
            self.logger.info("🏁 Fin de la pagination Trustpilot (dernière page atteinte)")
