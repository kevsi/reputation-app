import scrapy
import json
import os
from datetime import datetime
from sentinelle_scrapers.items import MentionItem

class GoogleReviewsSpider(scrapy.Spider):
    name = "google_reviews"
    
    def __init__(self, place_name=None, place_id=None, source_id=None, *args, **kwargs):
        super(GoogleReviewsSpider, self).__init__(*args, **kwargs)
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.place_name = place_name
        self.place_id = place_id
        self.source_id = source_id
        
        if not self.api_key:
            self.logger.error("❌ GOOGLE_API_KEY not found in environment!")

    def start_requests(self):
        if not self.api_key:
            return

        if self.place_id:
            yield self.make_details_request(self.place_id)
        elif self.place_name:
            # First find place ID
            search_url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={self.place_name}&key={self.api_key}"
            yield scrapy.Request(search_url, callback=self.parse_search)

    def parse_search(self, response):
        data = json.loads(response.text)
        if data.get("status") == "OK" and data.get("results"):
            place_id = data["results"][0]["place_id"]
            yield self.make_details_request(place_id)
        else:
            self.logger.warning(f"No place found for {self.place_name}")

    def make_details_request(self, place_id):
        details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews,name,rating&key={self.api_key}"
        return scrapy.Request(details_url, callback=self.parse_details)

    def parse_details(self, response):
        data = json.loads(response.text)
        if data.get("status") != "OK":
            self.logger.error(f"Google API error: {data.get('status')}")
            return

        result = data.get("result", {})
        reviews = result.get("reviews", [])
        
        for review in reviews:
            item = MentionItem()
            item['external_id'] = f"google-{review.get('author_name')}-{review.get('time')}"
            item['source_id'] = self.source_id
            item['platform'] = "google_reviews"
            item['author'] = review.get('author_name', 'Anonymous')
            item['content'] = review.get('text', '[No text]')
            item['rating'] = review.get('rating')
            item['url'] = f"https://www.google.com/maps/search/?api=1&query={self.place_name}"
            
            item['published_at'] = datetime.fromtimestamp(review.get('time')).isoformat()
            item['scraped_at'] = datetime.now().isoformat()
            
            item['metadata'] = {
                "author_url": review.get("author_url"),
                "language": review.get("language"),
                "relative_time_description": review.get("relative_time_description")
            }
            
            yield item
