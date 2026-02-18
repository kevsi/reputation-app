import scrapy
from datetime import datetime
from sentinelle_scrapers.items import MentionItem

class SensCritiqueSpider(scrapy.Spider):
    name = "senscritique"
    allowed_domains = ["senscritique.com"]

    def __init__(self, url=None, source_id=None, *args, **kwargs):
        super(SensCritiqueSpider, self).__init__(*args, **kwargs)
        self.start_urls = [url] if url else []
        self.source_id = source_id

    def parse(self, response):
        """
        Parses the SensCritique review page.
        """
        # Attempt to find review cards
        # We'll try common selectors and log what we find
        reviews = response.css('[data-testid="critic-card"]')
        
        if not reviews:
            # Fallback for older or different versions of the site
            reviews = response.css('div.ProductReview__ReviewContainer-sc-1sq6v2e-0') or \
                      response.css('article')

        self.logger.info(f"Found {len(reviews)} potential review elements")

        for review in reviews:
            # Try to get the title
            title = review.css('h2::text').get() or \
                    review.css('h3::text').get() or \
                    review.css('[data-testid="critic-title"]::text').get() or ''
            
            # Author: Look for links to profiles or names near the review
            author = review.css('a[href*="/profil/"]::text').get() or \
                     review.css('[data-testid*="author"]::text').get() or \
                     review.css('.ProductReview__AuthorName::text').get() or \
                     review.xpath('.//a[contains(@href, "/profil/")]/text()').get() or \
                     'Anonymous'
            
            # Content
            content = review.css('.ProductReview__ReviewContent::text').get() or \
                      review.css('[data-testid="critic-content"]::text').get() or \
                      review.xpath('.//div[contains(@class, "ReviewContent")]/text()').get() or \
                      review.css('p::text').get() or ''
            
            full_text = f"{title}\n\n{content}".strip()
            
            # If still empty, the data might be in a JSON script tag in the page
            # But let's try to get at least the titles we saw
            if not title and not content:
                continue

            # Rating
            rating_text = review.css('[data-testid="rating"]::text').get() or \
                          review.css('.ProductReview__Rating::text').get() or \
                          review.xpath('.//*[contains(@class, "Rating")]/text()').get()
            
            # Date
            date_published = review.css('time::attr(datetime)').get() or \
                             review.css('[data-testid="critic-date"]::attr(datetime)').get() or \
                             review.xpath('.//time/@datetime').get()
            
            # URL
            relative_url = review.css('a[href*="/critique/"]::attr(href)').get()
            review_url = response.urljoin(relative_url) if relative_url else response.url
            
            # ID
            external_id = relative_url.split('/')[-1] if relative_url else f"sc-{hash(full_text)}"

            item = MentionItem()
            item['external_id'] = external_id
            item['source_id'] = self.source_id
            item['platform'] = "senscritique"
            item['author'] = author.strip()
            item['content'] = full_text
            item['rating'] = int(rating_text) if rating_text and rating_text.isdigit() else None
            item['url'] = review_url
            item['published_at'] = date_published
            item['scraped_at'] = datetime.now().isoformat()
            
            item['metadata'] = {
                "source_url": response.url
            }
            
            yield item

        # --- LOGIQUE DE PAGINATION ---
        # SensCritique utilise souvent des boutons "Suivant" ou des liens de pagination
        # On tente de trouver le lien 'Suivant' via le texte ou des classes communes
        next_page = response.css('a[rel="next"]::attr(href)').get() or \
                    response.css('a.next::attr(href)').get() or \
                    response.xpath('//a[contains(text(), "Suivant")]/@href').get()

        if next_page:
            self.logger.info(f"⏭️  Saut vers la page suivante SensCritique : {next_page}")
            yield response.follow(next_page, callback=self.parse)
        else:
            self.logger.info("🏁 Fin de la pagination SensCritique")
