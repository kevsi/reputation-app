# 🧪 Guide Complet de Test CRUD Sources

## Prérequis
```bash
# Démarrer le serveur
npm run dev
```

## 📋 Tests avec cURL

### 1. GET - Lire toutes les sources
```bash
curl http://localhost:5000/api/v1/sources
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "TechCrunch",
      "url": "https://techcrunch.com",
      "type": "news",
      "isActive": true,
      "createdAt": "2024-01-15T00:00:00.000Z"
    },
    ...
  ],
  "count": 3
}
```

---

### 2. GET - Lire les sources actives uniquement
```bash
curl http://localhost:5000/api/v1/sources/active
```

**Réponse attendue :** Seulement les sources avec `isActive: true`

---

### 3. GET - Lire une source spécifique
```bash
# Source existante
curl http://localhost:5000/api/v1/sources/1

# Source inexistante (devrait renvoyer 404)
curl http://localhost:5000/api/v1/sources/999
```

**Réponse 200 (trouvée) :**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "TechCrunch",
    ...
  }
}
```

**Réponse 404 (non trouvée) :**
```json
{
  "success": false,
  "message": "Source with id 999 not found"
}
```

---

### 4. POST - Créer une nouvelle source

```bash
# Création réussie
curl -X POST http://localhost:5000/api/v1/sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Le Monde",
    "url": "https://lemonde.fr",
    "type": "news"
  }'

# Avec isActive spécifié
curl -X POST http://localhost:5000/api/v1/sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Twitter Tech",
    "url": "https://twitter.com/tech",
    "type": "social_media",
    "isActive": true
  }'
```

**Réponse 201 (Created) :**
```json
{
  "success": true,
  "data": {
    "id": "4",
    "name": "Le Monde",
    "url": "https://lemonde.fr",
    "type": "news",
    "isActive": true,
    "createdAt": "2026-01-15T..."
  }
}
```

**Tests d'erreur :**

```bash
# Champs manquants (400 Bad Request)
curl -X POST http://localhost:5000/api/v1/sources \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Type invalide (400 Bad Request)
curl -X POST http://localhost:5000/api/v1/sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "url": "https://test.com",
    "type": "invalid_type"
  }'
```

---

### 5. PATCH - Mettre à jour une source

```bash
# Désactiver une source
curl -X PATCH http://localhost:5000/api/v1/sources/1 \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# Changer le nom ET l'URL
curl -X PATCH http://localhost:5000/api/v1/sources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCrunch France",
    "url": "https://techcrunch.fr"
  }'

# Changer seulement le type
curl -X PATCH http://localhost:5000/api/v1/sources/2 \
  -H "Content-Type: application/json" \
  -d '{"type": "website"}'
```

**Réponse 200 (OK) :**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "TechCrunch France",
    "url": "https://techcrunch.fr",
    "type": "news",
    "isActive": false,
    "createdAt": "2024-01-15T..."
  }
}
```

**Tests d'erreur :**

```bash
# Aucun champ fourni (400 Bad Request)
curl -X PATCH http://localhost:5000/api/v1/sources/1 \
  -H "Content-Type: application/json" \
  -d '{}'

# ID inexistant (404 Not Found)
curl -X PATCH http://localhost:5000/api/v1/sources/999 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

---

### 6. DELETE - Supprimer une source

```bash
# Supprimer une source existante
curl -X DELETE http://localhost:5000/api/v1/sources/3

# Essayer de supprimer une source inexistante
curl -X DELETE http://localhost:5000/api/v1/sources/999
```

**Réponse 200 (OK) :**
```json
{
  "success": true,
  "message": "Source with id 3 successfully deleted"
}
```

**Réponse 404 (Not Found) :**
```json
{
  "success": false,
  "message": "Source with id 999 not found"
}
```

---

## 🔄 Scénario de Test Complet

Voici un scénario qui teste toutes les opérations dans l'ordre :

```bash
# 1. Voir toutes les sources initiales
curl http://localhost:5000/api/v1/sources

# 2. Créer une nouvelle source
curl -X POST http://localhost:5000/api/v1/sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Source",
    "url": "https://test.com",
    "type": "website"
  }'
# Notez l'ID retourné (ex: "4")

# 3. Lire cette nouvelle source
curl http://localhost:5000/api/v1/sources/4

# 4. Mettre à jour cette source
curl -X PATCH http://localhost:5000/api/v1/sources/4 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Source Updated"}'

# 5. Vérifier la mise à jour
curl http://localhost:5000/api/v1/sources/4

# 6. Supprimer cette source
curl -X DELETE http://localhost:5000/api/v1/sources/4

# 7. Vérifier qu'elle n'existe plus (devrait renvoyer 404)
curl http://localhost:5000/api/v1/sources/4
```

---

## 📊 Codes de statut HTTP utilisés

| Code | Nom | Quand l'utiliser |
|------|-----|------------------|
| 200 | OK | Opération réussie (GET, PATCH, DELETE) |
| 201 | Created | Ressource créée avec succès (POST) |
| 400 | Bad Request | Données invalides envoyées par le client |
| 404 | Not Found | Ressource demandée n'existe pas |
| 500 | Internal Server Error | Erreur serveur (géré par le middleware) |

---

## 🛠️ Alternative : Utiliser Postman

1. Télécharge [Postman](https://www.postman.com/downloads/)
2. Crée une nouvelle Collection "Sentinelle Sources"
3. Ajoute chaque requête avec :
   - Method (GET, POST, PATCH, DELETE)
   - URL
   - Headers (Content-Type: application/json pour POST/PATCH)
   - Body (raw JSON pour POST/PATCH)

**Avantage :** Interface visuelle + sauvegarde des requêtes

---

## ✅ Checklist de test

- [ ] GET toutes les sources fonctionne
- [ ] GET sources actives fonctionne
- [ ] GET une source par ID fonctionne
- [ ] GET une source inexistante renvoie 404
- [ ] POST créer une source fonctionne
- [ ] POST sans champs requis renvoie 400
- [ ] POST avec type invalide renvoie 400
- [ ] PATCH mettre à jour une source fonctionne
- [ ] PATCH sans champs renvoie 400
- [ ] PATCH source inexistante renvoie 404
- [ ] DELETE supprimer une source fonctionne
- [ ] DELETE source inexistante renvoie 404