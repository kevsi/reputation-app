
from fastapi import HTTPException

class BaseAIException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class ModelLoadException(BaseAIException):
    def __init__(self, model_name: str, error: str):
        super().__init__(
            status_code=503,
            detail=f"Erreur lors du chargement du modèle {model_name}: {error}"
        )

class AnalysisException(BaseAIException):
    def __init__(self, detail: str = "Erreur lors de l'analyse"):
        super().__init__(status_code=500, detail=detail)

class LanguageNotSupportedException(BaseAIException):
    def __init__(self, lang: str):
        super().__init__(
            status_code=400,
            detail=f"Langue non supportée: {lang}"
        )
