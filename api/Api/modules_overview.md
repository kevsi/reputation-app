# 📊 Vue d'Ensemble Complète des 12 Modules

## 🎯 Complexité et Ordre Suggéré

| # | Module | Difficulté | Durée estimée | Dépendances | Priorité |
|---|--------|------------|---------------|-------------|----------|
| 1 | **sources** ✅ | ⭐ Facile | FAIT | Aucune | Haute |
| 2 | **keywords** | ⭐ Facile | 20 min | organizations | Haute |
| 3 | **brands** | ⭐ Facile | 20 min | organizations | Moyenne |
| 4 | **organizations** | ⭐⭐ Moyen | 30 min | Aucune | Haute |
| 5 | **users** | ⭐⭐⭐ Moyen+ | 45 min | organizations | Haute |
| 6 | **mentions** | ⭐⭐⭐ Moyen+ | 40 min | sources, organizations | Haute |
| 7 | **alerts** | ⭐⭐ Moyen | 30 min | mentions | Haute |
| 8 | **actions** | ⭐⭐ Moyen | 25 min | alerts, users | Moyenne |
| 9 | **reports** | ⭐⭐⭐ Difficile | 60 min | analytics, mentions | Moyenne |
| 10 | **analytics** | ⭐⭐⭐ Difficile | 50 min | mentions, alerts | Moyenne |
| 11 | **auth** | ⭐⭐⭐⭐ Difficile | 90 min | users | Haute |
| 12 | **billing** | ⭐⭐⭐⭐ Difficile | 120 min | organizations, Stripe | Basse |

---

## 🎨 Détail de Chaque Module

### 1. ✅ **sources** (FAIT)
**Ce qu'il fait** : Gère les sources d'information à monitorer  
**Routes** : GET, POST, PATCH, DELETE  
**Champs clés** : name, url, type, isActive

---

### 2. 🔤 **keywords**
**Ce qu'il fait** : Mots-clés à surveiller pour chaque organisation

```typescript
interface Keyword {
  id: string;
  organizationId: string;  // Quelle organisation possède ce keyword
  term: string;            // "iPhone 15", "Tesla Model 3"
  category: string;        // "product", "brand", "competitor"
  isActive: boolean;
  createdAt: Date;
}
```

**Routes spécifiques** :
- `GET /keywords?organizationId=123` - Keywords d'une orga
- `GET /keywords/active` - Seulement les actifs

**Exemple d'utilisation** :
```bash
curl -X POST http://localhost:5000/api/v1/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-1",
    "term": "iPhone 15",
    "category": "product",
    "isActive": true
  }'
```

---

### 3. 🏷️ **brands**
**Ce qu'il fait** : Marques surveillées par une organisation

```typescript
interface Brand {
  id: string;
  organizationId: string;
  name: string;
  logo?: string;      // URL vers le logo
  website?: string;
  industry: string;   // "tech", "fashion", "food"
  createdAt: Date;
}
```

**Routes spécifiques** :
- `GET /brands?organizationId=123`

---

### 4. 🏢 **organizations**
**Ce qu'il fait** : Entreprises utilisant la plateforme

```typescript
interface Organization {
  id: string;
  name: string;
  industry: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  maxUsers: number;
  maxKeywords: number;
  maxSources: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Routes spécifiques** :
- `GET /organizations/:id/users` - Users de l'orga
- `GET /organizations/:id/stats` - Statistiques

**Complexité** : Moyen (beaucoup de relations)

---

### 5. 👥 **users**
**Ce qu'il fait** : Utilisateurs de la plateforme

```typescript
interface User {
  id: string;
  email: string;
  password: string;  // ⚠️ HASHED avec bcrypt
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}
```

**⚠️ IMPORTANT** :
```typescript
// ❌ JAMAIS faire ça
res.json({ data: user }); // Inclut le password !

// ✅ TOUJOURS faire ça
const { password, ...userWithoutPassword } = user;
res.json({ data: userWithoutPassword });
```

**Routes spécifiques** :
- `GET /users/me` - User connecté
- `PATCH /users/me/password` - Changer mot de passe

---

### 6. 🔍 **mentions**
**Ce qu'il fait** : Mentions trouvées sur les sources

```typescript
interface Mention {
  id: string;
  sourceId: string;
  organizationId: string;
  keywordId?: string;      // Quel keyword a déclenché ?
  title: string;
  content: string;
  url: string;
  author?: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  sentimentScore?: number; // -1 à 1
  language: string;
  detectedAt: Date;
  processedAt?: Date;
}
```

**Routes spécifiques** :
- `GET /mentions?organizationId=123&sentiment=negative`
- `GET /mentions?startDate=2024-01-01&endDate=2024-01-31`
- `GET /mentions/stats` - Agrégations

**Complexité** : Moyen+ (beaucoup de filtres)

---

### 7. 📢 **alerts**
**Ce qu'il fait** : Alertes générées depuis les mentions

```typescript
interface Alert {
  id: string;
  mentionId: string;
  organizationId: string;
  userId?: string;         // Assigné à
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'false_positive';
  priority: number;        // 1-5
  createdAt: Date;
  resolvedAt?: Date;
}
```

**Routes spécifiques** :
- `GET /alerts?status=new&severity=high`
- `PATCH /alerts/:id/assign` - Assigner à un user
- `PATCH /alerts/:id/resolve` - Marquer résolu

---

### 8. 🎬 **actions**
**Ce qu'il fait** : Actions prises sur les alertes

```typescript
interface Action {
  id: string;
  alertId: string;
  userId: string;          // Qui a fait l'action
  type: 'response' | 'escalate' | 'ignore' | 'forward';
  note?: string;
  attachments?: string[];  // URLs
  createdAt: Date;
}
```

**Routes spécifiques** :
- `GET /alerts/:alertId/actions` - Historique d'actions
- `POST /alerts/:alertId/actions` - Nouvelle action

---

### 9. 📊 **reports**
**Ce qu'il fait** : Rapports générés automatiquement

```typescript
interface Report {
  id: string;
  organizationId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  format: 'pdf' | 'excel' | 'json';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  data: {
    totalMentions: number;
    positiveCount: number;
    negativeCount: number;
    topKeywords: string[];
    // ... beaucoup plus de métriques
  };
  fileUrl?: string;        // URL du rapport généré
  generatedAt?: Date;
  createdAt: Date;
}
```

**Routes spécifiques** :
- `POST /reports/generate` - Générer un nouveau rapport
- `GET /reports/:id/download` - Télécharger le PDF

**Complexité** : Difficile (agrégation de données)

---

### 10. 📈 **analytics**
**Ce qu'il fait** : Métriques et statistiques

```typescript
interface AnalyticsEntry {
  id: string;
  organizationId: string;
  metric: string;          // "mentions_count", "sentiment_avg"
  value: number;
  dimensions: {
    source?: string;
    keyword?: string;
    date?: string;
  };
  timestamp: Date;
}
```

**Routes spécifiques** :
- `GET /analytics/dashboard?organizationId=123`
- `GET /analytics/trends?metric=mentions_count&period=7d`

**Complexité** : Difficile (beaucoup de calculs)

---

### 11. 🔐 **auth** (Pas un module CRUD standard)
**Ce qu'il fait** : Authentification et autorisation

**Routes** :
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/refresh` - Rafraîchir le token
- `POST /auth/forgot-password`
- `POST /auth/reset-password/:token`
- `GET /auth/verify-email/:token`

**Technologies** :
- JWT (jsonwebtoken)
- bcrypt (hash passwords)
- nodemailer (emails)

**Complexité** : Difficile (sécurité critique)

---

### 12. 💳 **billing** (Intégration externe)
**Ce qu'il fait** : Gestion des abonnements et paiements

```typescript
interface Subscription {
  id: string;
  organizationId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  stripeInvoiceId: string;
  pdfUrl?: string;
  createdAt: Date;
}
```

**Routes** :
- `POST /billing/subscribe` - S'abonner
- `POST /billing/upgrade` - Changer de plan
- `POST /billing/cancel` - Annuler
- `POST /billing/webhooks/stripe` - Webhooks Stripe
- `GET /billing/invoices` - Historique factures

**Complexité** : Très difficile (intégration Stripe)

---

## 🔗 Graphe des Dépendances

```
organizations
    ↓
    ├── users
    ├── keywords
    ├── brands
    └── sources
            ↓
        mentions ← keywords
            ↓
         alerts
            ↓
         actions ← users
            
analytics ← mentions, alerts
reports ← analytics, mentions
billing ← organizations
auth ← users
```

---

## 🎯 Plan d'Action Suggéré

### Semaine 1 : Fondations
- [x] sources ✅
- [ ] keywords
- [ ] brands
- [ ] organizations

### Semaine 2 : Utilisateurs
- [ ] users
- [ ] auth (basique : login/register)

### Semaine 3 : Coeur métier
- [ ] mentions
- [ ] alerts
- [ ] actions

### Semaine 4 : Analytiques
- [ ] analytics (basique)
- [ ] reports (simple)

### Semaine 5 : Finitions
- [ ] auth (complet : reset password, etc.)
- [ ] billing (si nécessaire)

---

## 💪 Challenge pour Toi

**Objectif : Créer "keywords" en 30 minutes**

1. ⏱️ Chronomètre
2. Copie le template de sources
3. Adapte pour keywords
4. Teste avec cURL
5. Commit Git

Si tu réussis, tu es prêt pour tout ! 🚀