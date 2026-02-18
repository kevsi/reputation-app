# 📡 API Endpoints - Sentinelle Reputation

Base URL: `http://localhost:5001/api/v1`

---

## 🔐 Authentication (`/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Créer un compte | ❌ |
| POST | `/auth/login` | Connexion | ❌ |
| POST | `/auth/logout` | Déconnexion | ✅ |
| GET | `/auth/me` | Profil utilisateur | ✅ |
| POST | `/auth/refresh` | Rafraîchir token | ❌ |
| POST | `/auth/forgot-password` | Mot de passe oublié | ❌ |
| POST | `/auth/reset-password` | Réinitialiser mot de passe | ❌ |
| PATCH | `/auth/change-password` | Changer mot de passe | ✅ |
| POST | `/auth/verify-email` | Vérifier email | ❌ |

### Exemples cURL

```bash
# 1. Inscription
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "organizationName": "My Company"
  }'

# 2. Connexion
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# 3. Profil (avec token)
curl -X GET http://localhost:5001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Rafraîchir token
curl -X POST http://localhost:5001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 🏢 Organizations (`/organizations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/organizations` | Liste organisations | ❌ |
| GET | `/organizations/:id` | Détails organisation | ❌ |
| POST | `/organizations` | Créer organisation | ❌ |
| PATCH | `/organizations/:id` | Modifier organisation | ❌ |
| DELETE | `/organizations/:id` | Supprimer organisation | ❌ |

### Exemples cURL

```bash
# Liste organisations
curl -X GET http://localhost:5001/api/v1/organizations

# Détails organisation
curl -X GET http://localhost:5001/api/v1/organizations/org_abc123

# Créer organisation
curl -X POST http://localhost:5001/api/v1/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Company",
    "slug": "new-company",
    "industry": "Technology"
  }'
```

---

## 🏷️ Brands (`/brands`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/brands` | Liste marques | ✅ |
| GET | `/brands/:id` | Détails marque | ✅ |
| POST | `/brands` | Créer marque | ✅ |
| PATCH | `/brands/:id` | Modifier marque | ✅ |
| DELETE | `/brands/:id` | Supprimer marque | ✅ |
| GET | `/brands/:brandId/sources` | Sources d'une marque | ✅ |
| POST | `/brands/:brandId/sources` | Ajouter source | ✅ |

### Exemples cURL

```bash
# Liste marques (avec token)
curl -X GET http://localhost:5001/api/v1/brands \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Créer une marque
curl -X POST http://localhost:5001/api/v1/brands \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple",
    "website": "https://apple.com",
    "organizationId": "org_abc123"
  }'
```

---

## 📰 Sources (`/sources`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/sources/:sourceId` | Détails source | ✅ |
| PATCH | `/sources/:sourceId` | Modifier source | ✅ |
| DELETE | `/sources/:sourceId` | Supprimer source | ✅ |
| PATCH | `/sources/:sourceId/status` | Statut source | ✅ |
| POST | `/sources/:sourceId/scrape` | Lancer scraping | ✅ |

### Source Analyzer (`/sources/analyze-*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sources/analyze-docs` | Documentation |
| POST | `/sources/analyze` | Analyser URL |
| POST | `/sources/analyze/batch` | Analyser plusieurs URLs |
| POST | `/sources/analyze-and-create` | Analyser et créer |

### Exemples cURL

```bash
# Analyser une URL
curl -X POST http://localhost:5001/api/v1/sources/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://trustpilot.com/review/example.com"
  }'

# Batch analysis
curl -X POST http://localhost:5001/api/v1/sources/analyze/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://trustpilot.com/review/example1.com",
      "https://google.com/search?q=example2+reviews"
    ]
  }'
```

---

## 📝 Mentions (`/mentions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/mentions` | Liste mentions | ✅ |
| GET | `/mentions/:id` | Détails mention | ✅ |
| POST | `/mentions` | Créer mention | ✅ |
| PATCH | `/mentions/:id` | Modifier mention | ✅ |
| DELETE | `/mentions/:id` | Supprimer mention | ✅ |
| POST | `/mentions/search` | Rechercher mentions | ✅ |
| POST | `/mentions/batch-action` | Action batch | ✅ |

### Exemples cURL

```bash
# Liste mentions (avec filtres)
curl -X GET "http://localhost:5001/api/v1/mentions?brandId=brand_abc123&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Rechercher mentions
curl -X POST http://localhost:5001/api/v1/mentions/search \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "apple",
    "sentiment": "negative",
    "dateFrom": "2024-01-01",
    "limit": 50
  }'
```

---

## 🔔 Alerts (`/alerts`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/alerts` | Liste alertes | ✅ |
| GET | `/alerts/:id` | Détails alerte | ✅ |
| POST | `/alerts` | Créer alerte | ✅ |
| PATCH | `/alerts/:id` | Modifier alerte | ✅ |
| DELETE | `/alerts/:id` | Supprimer alerte | ✅ |
| GET | `/alerts/:id/history` | Historique alerte | ✅ |
| POST | `/alerts/:id/test` | Tester alerte | ✅ |

### Exemples cURL

```bash
# Créer une alerte
curl -X POST http://localhost:5001/api/v1/alerts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Negative Review",
    "type": "sentiment",
    "condition": {
      "sentiment": "negative",
      "scoreThreshold": 0.3
    },
    "brandId": "brand_abc123",
    "channels": ["email", "webhook"]
  }'

# Tester une alerte
curl -X POST http://localhost:5001/api/v1/alerts/alert_abc123/test \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Analytics (`/analytics`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/analytics/summary` | Résumé global | ✅ |
| GET | `/analytics/sentiment-breakdown` | Répartition sentiment | ✅ |
| GET | `/analytics/time-series` | Série temporelle | ✅ |
| GET | `/analytics/word-cloud` | Nuage de mots | ✅ |

### Exemples cURL

```bash
# Résumé analytics
curl -X GET "http://localhost:5001/api/v1/analytics/summary?brandId=brand_abc123" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Répartition sentiment
curl -X GET "http://localhost:5001/api/v1/analytics/sentiment-breakdown?brandId=brand_abc123&period=30d" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Time series
curl -X GET "http://localhost:5001/api/v1/analytics/time-series?brandId=brand_abc123&metric=mentions&interval=daily" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📈 Reports (`/reports`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports` | Liste rapports | ✅ |
| GET | `/reports/:id` | Détails rapport | ✅ |
| POST | `/reports/generate` | Générer rapport | ✅ |
| GET | `/reports/scheduled` | Rapports planifiés | ✅ |
| DELETE | `/reports/:id` | Supprimer rapport | ✅ |

### Exemples cURL

```bash
# Générer un rapport
curl -X POST http://localhost:5001/api/v1/reports/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "weekly",
    "brandId": "brand_abc123",
    "format": "pdf",
    "emailTo": ["team@example.com"]
  }'
```

---

## 👥 Users (`/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Liste utilisateurs | ✅ |
| GET | `/users/active` | Utilisateurs actifs | ✅ |
| GET | `/users/:id` | Détails utilisateur | ✅ |
| POST | `/users` | Créer utilisateur | ✅ |
| PATCH | `/users/:id` | Modifier utilisateur | ✅ |
| DELETE | `/users/:id` | Supprimer utilisateur | ✅ |

---

## 🔑 Keywords (`/keywords`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/keywords` | Liste mots-clés | ✅ |
| GET | `/keywords/brand/:brandId` | Mots-clés marque | ✅ |
| POST | `/keywords/brand/:brandId` | Ajouter mot-clé | ✅ |
| DELETE | `/keywords/brand/:brandId` | Supprimer mot-clé | ✅ |
| POST | `/keywords` | Créer mot-clé | ✅ |

---

## 💳 Billing (`/billing`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/billing/plans` | Liste plans | ❌ |
| GET | `/billing/subscription/:organizationId` | Abonnement | ✅ |
| POST | `/billing/subscribe` | Souscrire | ✅ |
| POST | `/billing/confirm` | Confirmer paiement | ✅ |
| GET | `/billing/invoices/:subscriptionId` | Factures | ✅ |

---

## 🔔 Notifications (`/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Liste notifications | ✅ |
| GET | `/notifications/unread` | Non lues | ✅ |
| PATCH | `/notifications/:id/read` | Marquer lu | ✅ |
| PATCH | `/notifications/read-all` | Tout marquer lu | ✅ |
| DELETE | `/notifications/:id` | Supprimer | ✅ |
| GET | `/notifications/preferences` | Préférences | ✅ |
| PUT | `/notifications/preferences` | Modifier préférences | ✅ |

---

## ⚙️ System (`/system`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/system/status` | Statut système | ✅ (Admin) |

---

## 🏃 Actions (`/actions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/actions` | Liste actions | ✅ |
| GET | `/actions/:id` | Détails action | ✅ |
| POST | `/actions` | Créer action | ✅ |
| PATCH | `/actions/:id` | Modifier action | ✅ |
| DELETE | `/actions/:id` | Supprimer action | ✅ |

---

## 🏥 Health & Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/metrics` | Métriques Prometheus |

### Exemples cURL

```bash
# Health check
curl http://localhost:5001/health

# Métriques Prometheus
curl http://localhost:5001/metrics
```

---

## 🧪 Demo Endpoints (Dev Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/demo/mentions` | Mentions démo |
| GET | `/demo/brands` | Marques démo |

---

## 📝 Notes

### Headers requis
```bash
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Variables d'environnement
```bash
PORT=5001
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
JWT_SECRET=your-secret-key
```

### Codes réponse
- `200` - Succès
- `201` - Créé
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
