
from functools import lru_cache
from typing import Callable, Any
from ..config.settings import settings

def simple_memory_cache():
    """
    Decorator for simple LRU caching in memory.
    Wraps functools.lru_cache using settings.
    """
    if settings.ENABLE_CACHE:
        return lru_cache(maxsize=settings.CACHE_SIZE)
    return lambda func: func

class CacheManager:
    """Interface for more complex caching (Redis) in future."""
    pass
