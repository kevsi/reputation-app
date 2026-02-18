from functools import wraps
from fastapi import HTTPException, status
from loguru import logger
import time
from collections import defaultdict
from threading import Lock

# Store pour les rate limits (en production, utiliser Redis)
rate_limit_store = defaultdict(list)
rate_limit_lock = Lock()

def rate_limit(calls: int = 10, period: int = 60):
    """
    Décorateur de rate limiting
    
    Args:
        calls: Nombre d'appels autorisés
        period: Période en secondes
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Identifier l'endpoint
            endpoint = func.__name__
            current_time = time.time()
            
            with rate_limit_lock:
                # Nettoyer les anciens appels
                rate_limit_store[endpoint] = [
                    timestamp for timestamp in rate_limit_store[endpoint]
                    if current_time - timestamp < period
                ]
                
                # Vérifier le nombre d'appels
                if len(rate_limit_store[endpoint]) >= calls:
                    logger.warning(f"Rate limit exceeded for {endpoint}")
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Rate limit: {calls} calls per {period} seconds"
                    )
                
                # Enregistrer cet appel
                rate_limit_store[endpoint].append(current_time)
            
            # Exécuter la fonction
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator
