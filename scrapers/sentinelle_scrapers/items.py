import scrapy

class MentionItem(scrapy.Item):
    """
    Standardized item for all collected mentions in Sentinelle Reputation.
    Focus is purely on data collection.
    """
    # Core identification
    external_id = scrapy.Field()  # Original ID from source
    source_id = scrapy.Field()    # Internal ID for the source config
    platform = scrapy.Field()     # e.g., 'trustpilot', 'google', 'news'
    
    # Content
    author = scrapy.Field()       # Author name/handle
    content = scrapy.Field()      # Main text
    rating = scrapy.Field()       # Scalar value (optional)
    url = scrapy.Field()          # Direct link to the mention
    
    # Timestamps
    published_at = scrapy.Field() # Original publication date
    scraped_at = scrapy.Field()   # Date of collection
    
    # Extended data
    title = scrapy.Field()        # Optional title
    metadata = scrapy.Field()     # Dictionary for platform-specific extra data
    engagement = scrapy.Field()   # Likes, shares, etc.
