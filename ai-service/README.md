
# 🤖 Sentinelle AI Service

Microservice d'Intelligence Artificielle pour la plateforme Sentinelle-Reputation.
Expose une API REST haute performance pour l'analyse de texte.

## 🚀 Fonctionnalités

- **Analyse de Sentiment** : Positif, Négatif, Neutre, Mitigé (Modèles BERT multilingues)
- **Détection d'Émotions** : Joie, Colère, Tristesse, Peur, Surprise, Dégoût
- **Extraction de Mots-clés** : Identification des entités (SpaCy) et sujets pertinents (YAKE)
- **Détection de Langue** : Support multilingue (langdetect)
- **Analyse de Topics** : Clustering de sujets (N-grams)

## 🛠️ Stack Technique

- **Python 3.11**
- **FastAPI** + Uvicorn
- **Hugging Face Transformers**
- **SpaCy** + **YAKE**
- **Pydantic V2**

## 🏁 Démarrage Rapide

### Pré-requis

- Python 3.11+
- Virtualenv

### Installation

```bash
cd ai-service

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Télécharger les modèles linguistiques
python -m spacy download fr_core_news_sm
python -m spacy download en_core_web_sm
```

### Configuration

Copiez le fichier d'exemple :

```bash
cp .env.example .env
```

Vous pouvez ajuster les modèles et les performances (CPU/GPU) dans ce fichier.

### Lancement

```bash
# Lancer le serveur
python src/main.py

# OU avec Uvicorn et auto-reload
uvicorn src.main:app --reload
```

Le service sera accessible sur `http://localhost:8000`.
Documentation interactive (Swagger) : `http://localhost:8000/docs`

## 🐳 Docker

```bash
# Build
docker build -t sentinelle-ai-service .

# Run
docker run -p 8000:8000 sentinelle-ai-service
```

## 🔌 Endpoints de l'API

### 1. Health Checks
- `GET /health` : Vérifie l'état du service
- `GET /ready` : Vérifie si les modèles sont chargés en mémoire

### 2. Analyse
- `POST /analyze/sentiment`
  ```json
  { "text": "J'adore ce produit !" }
  ```
- `POST /analyze/emotions`
  ```json
  { "text": "Je suis très déçu du service." }
  ```
- `POST /analyze/keywords`
  ```json
  { "text": "Apple a annoncé l'iPhone 15 hier.", "max_keywords": 5 }
  ```
- `POST /analyze/topics`
  ```json
  { "texts": ["Message 1", "Message 2"] }
  ```
- `POST /detect/language`
  ```json
  { "text": "This is a test." }
  ```

## 🧪 Tests

```bash
# Installer les dépendances de dev
pip install -r requirements-dev.txt

# Lancer les tests
pytest
```
