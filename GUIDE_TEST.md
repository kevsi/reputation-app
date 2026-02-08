# 🧪 GUIDE DE TEST - PAGES RECONSTRUITES

**Projet:** Sentinelle Reputation - Web App  
**Date:** 5 Février 2026  
**Version:** 1.0

---

## ✅ PAGES TESTÉES & CORRIGÉES

| Page | Statut | Changements |
|------|--------|-----------|
| **Actions** | ✅ RÉPARÉE | Appels API intégrés, loading/error states, synchronisation CRUD |
| **Analysis** | ✅ RÉPARÉE | Appels API `/sentiment-breakdown`, gestion des périodes, AI insights dynamiques |
| **Alerts** | ✅ RÉPARÉE | Utilise `brandId` au lieu de `organizationId`, vérification `isApiError()`, transformation robuste |
| **Reports** | ⏳ À TESTER | À corriger - structure API manquée |
| **Sources** | ⏳ À TESTER | À corriger - structure API incohérente |

---

## 🚀 INSTRUCTIONS DE TEST

### Prérequis

1. **Démarrer le backend:**
   ```bash
   cd api
   npm run dev
   # Doit écouter sur http://localhost:5001
   ```

2. **Démarrer le frontend (web):**
   ```bash
   cd apps/web
   npm run dev
   # Doit démarrer sur http://localhost:3000
   ```

3. **Vérifier les variables d'environnement:**
   ```bash
   # apps/web/.env (ou .env.local)
   VITE_API_URL=http://localhost:5001/api/v1
   ```

---

## 📋 PLAN DE TEST PAR PAGE

### 1️⃣ **PAGE ACTIONS** (`/actions`)

**Test 1 - Chargement initial**
- [ ] Vérifier que la page affiche un **spinner de chargement**
- [ ] Attendre le chargement des données depuis l'API
- [ ] Vérifier que les **statistiques s'affichent** (En attente, En cours, Terminées)
- [ ] Vérifier que les **actions s'affichent par colonne**

**Test 2 - Affichage des données**
- [ ] Actions en attente (pending) s'affichent dans la colonne de gauche
- [ ] Actions en cours (in-progress) s'affichent dans la colonne du milieu
- [ ] Actions complétées s'affichent dans la colonne de droite
- [ ] Les timestamps et assignés s'affichent correctement

**Test 3 - Interactions**
- [ ] Cliquer sur "Démarrer" pour une action en attente
  - Doit appeler `PATCH /actions/:id` avec `status: 'in-progress'`
  - Doit être déplacée vers "En cours"
  - Doit afficher un loading pendant l'opération
  
- [ ] Cliquer sur "Compléter" pour une action en cours
  - Doit appeler `PATCH /actions/:id` avec `status: 'completed'`
  - Doit être déplacée vers "Terminées"

**Test 4 - Gestion d'erreur**
- [ ] Vérifier que les erreurs API s'affichent dans une AlertBox rouge
- [ ] Bouton "Rafraîchir" doit relancer la requête
- [ ] Les erreurs doivent être gérées sans crash

**Test 5 - État vide**
- [ ] Créer un brand sans actions
- [ ] Vérifier l'affichage du message "Aucune action en attente"

---

### 2️⃣ **PAGE ANALYSIS** (`/analysis`)

**Test 1 - Chargement initial**
- [ ] Vérifier que la page affiche un **spinner de chargement**
- [ ] Attendre le chargement des données d'analyse
- [ ] Vérifier que le **sélecteur de période** s'affiche

**Test 2 - Appels API**
- [ ] Ouvrir DevTools (F12) > Network
- [ ] Attendre les requêtes API:
  - [ ] `GET /api/v1/analytics/sentiment-breakdown?brandId=...`
  - Vérifier le statut HTTP 200
  - Vérifier la structure JSON retournée

**Test 3 - Affichage des données**
- [ ] Graphique sentiment s'affiche avec pourcentages
- [ ] AI Insights se met à jour basé sur les données
  - Si sentiment > 50% positif: "Tendance positive"
  - Si sentiment > 40% négatif: "Attention requise"
  - Sinon: "Équilibre détecté"

**Test 4 - Changement de période**
- [ ] Sélectionner différentes périodes: 7j, 30j, 90j, 1y
- [ ] Chaque changement doit:
  - Recalculer les dates
  - Appeler l'API avec nouvelles dates
  - Afficher le spinner pendant le chargement
  - Mettre à jour les graphiques

**Test 5 - Gestion d'erreur**
- [ ] Arrêter le backend API
- [ ] Vérifier que l'erreur s'affiche
- [ ] Bouton "Réessayer" doit relancer la requête

---

### 3️⃣ **PAGE ALERTS** (`/alerts`)

**Test 1 - Chargement initial**
- [ ] Page affiche spinner de chargement
- [ ] Attendre le chargement des alertes du brand sélectionné
- [ ] Vérifier que les **stats urgentes/warnings s'affichent**

**Test 2 - Appels API (IMPORTANT)**
- [ ] Vérifier dans DevTools que l'API est appelée avec **`brandId`**
  - ✅ Correct: `GET /api/v1/alerts?brandId=abc123`
  - ❌ Incorrect (ancien): `GET /api/v1/alerts?organizationId=xyz`

**Test 3 - Affichage des alertes**
- [ ] Vérifier que les alertes s'affichent correctement
- [ ] Vérifier le mapping des severités:
  - CRITICAL/HIGH → type "urgent" (rouge)
  - MEDIUM → type "warning" (orange)
  - LOW → type "info" (bleu)

**Test 4 - État vide**
- [ ] Créer un brand sans alertes
- [ ] Vérifier l'affichage du message "Aucune alerte active"
- [ ] Bouton "Configurer mes alertes" visible

**Test 5 - Gestion des formats de réponse API**
- [ ] Tester les deux formats possibles:
  1. `{ success: true, data: Alert[] }`
  2. `{ data: { data: Alert[] } }` (imbriqué)
  
Vérifier que les deux fonctionnent sans erreur

---

## 🔍 CHECKLIST DE VALIDATION

### Code Quality
- [ ] Pas de `any` typage excessif
- [ ] Utilisation de `isApiError()` pour toutes les réponses API
- [ ] Pattern `try/catch` consistent
- [ ] Gestion des cas limites (empty state, error, loading)

### API Connectivity
- [ ] ✅ Bonnes URLs d'endpoint
- [ ] ✅ Bons paramètres querystring (`brandId`, `period`, etc.)
- [ ] ✅ Headers `Content-Type: application/json`
- [ ] ✅ Header `Authorization: Bearer <token>`

### UX/UI
- [ ] Loading spinners affichés pendant les requêtes
- [ ] Messages d'erreur clairs et actionnables
- [ ] Empty states informatifs
- [ ] Boutons "Rafraîchir" / "Réessayer" fonctionnels
- [ ] Pas de flicker ou clignotement

### Error Handling
- [ ] Erreurs API affichées à l'utilisateur
- [ ] Pas de crash silencieux
- [ ] Possibilité de réessayer après erreur
- [ ] Console sans erreurs JavaScript

---

## 📱 TESTS DE CAS LIMITES

### Cas 1: Pas de brand sélectionné
```
Attendu: Loading state disparaît, message "Sélectionnez une marque"
```

### Cas 2: API non disponible
```
Attendu: Message d'erreur, bouton Réessayer, pas de crash
```

### Cas 3: Données vides
```
Attendu: Empty state sympathique avec icône et message
```

### Cas 4: Changement de brand rapide
```
Attendu: Requête précédente annulée (aborted), nouvelle requête lancée
```

---

## 🐛 COMMANDES DE DEBUG

### Vérifier les appels API dans le navigateur:
```javascript
// Ouvrir DevTools > Console
// Voir les logs API
apiClient.get('/alerts', { brandId: 'test-id' })
  .then(res => console.log(res))
  .catch(err => console.error(err))
```

### Vérifier les erreurs réseau:
```
DevTools > Network > XHR/Fetch
Chercher les requêtes rouges (4xx, 5xx)
Vérifier la réponse JSON
```

### Mock data pour testing:
```javascript
// À utiliser si l'API n'a pas de données
const mockData = {
  actions: [
    {
      id: "1",
      title: "Test action",
      status: "pending",
      platform: "Twitter",
      priority: "Priorité haute",
      dueDate: "Aujourd'hui"
    }
  ]
};
```

---

## ✨ RÉSULTATS ATTENDUS APRÈS FIX

| Metrique | Avant | Après |
|----------|-------|-------|
| API Calls | ❌ Manquants/Incorrects | ✅ Corrects |
| Error Handling | ❌ Manquant | ✅ Complet |
| Loading States | ❌ Absents | ✅ Présents |
| Empty States | ❌ Absents | ✅ Présents |
| User Feedback | ❌ Silencieux | ✅ Clair |
| Type Safety | ⚠️ `any` | ✅ Typé |

---

## 📞 DÉPANNAGE

### Problem: "Cannot GET /api/v1/actions"
- **Cause:** Backend non démarré ou mauvais port
- **Solution:** `npm run dev` dans le dossier `api/`

### Problem: "Response was not JSON"
- **Cause:** API retourne du HTML (erreur 500) au lieu de JSON
- **Solution:** Vérifier les logs backend pour les erreurs

### Problem: "isApiError is not defined"
- **Cause:** Import manquant
- **Solution:** Ajouter `import { isApiError } from '@/types/http'`

### Problem: "brandId is undefined"
- **Cause:** Pas de brand sélectionné
- **Solution:** Sélectionner un brand dans la sidebar avant de tester

---

## 📝 RAPPORT DE TEST

À compléter après les tests:

```markdown
# Résultats de Test - [Date]

## Pages Testées
- [ ] Actions
- [ ] Analysis  
- [ ] Alerts
- [ ] Reports
- [ ] Sources

## Issues Trouvées
1. [Description]
   - Impacts: [UI/API/Logique]
   - Sévérité: Critique/Important/Moyen
   - Fix: [Description]

## Signature
Date: __________
Testeur: __________
```

---

**Fin du guide de test. Bonne chance! 🚀**
