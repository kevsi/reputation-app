from typing import Optional
import re
from fastapi import HTTPException, status

def validate_url(url: str, domain: Optional[str] = None) -> bool:
    """Valider qu'une URL est bien formée et optionnellement d'un domaine spécifique"""
    url_pattern = re.compile(
        r'^https?://'  # http:// ou https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )
    
    if not url_pattern.match(url):
        return False
    
    if domain and domain not in url:
        return False
    
    return True

def validate_place_id(place_id: str) -> bool:
    """Valider un Google Place ID"""
    # Place IDs commencent généralement par "ChIJ"
    if not place_id.startswith('ChIJ'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Place ID invalide (doit commencer par 'ChIJ')"
        )
    return True
