import random
from scrapy import signals

class RandomUserAgentMiddleware:
    """
    Middleware to rotate User-Agent for each request.
    Uses the list defined in settings.py
    """
    def __init__(self, user_agents):
        self.user_agents = user_agents

    @classmethod
    def from_crawler(cls, crawler):
        # Get UA list from settings
        ua_list = crawler.settings.get('USER_AGENTS')
        if not ua_list:
            raise ValueError("USER_AGENTS not found in settings.py")
        return cls(ua_list)

    def process_request(self, request, spider):
        ua = random.choice(self.user_agents)
        if ua:
            request.headers.setdefault('User-Agent', ua)
            # Optional: log the chosen UA for debugging
            # spider.logger.debug(f"Using User-Agent: {ua}")

class SentinelleScrapersSpiderMiddleware:
    def spider_opened(self, spider):
        spider.logger.info("Spider opened: %s" % spider.name)
