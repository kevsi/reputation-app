# 📋 AUDIT PROJET WEB - SENTINELLE REPUTATION

**Date:** 5 Février 2026  
**Projet:** Sentinelle Reputation - Web App (Apps/Web)  
**Status:** ⚠️ **AUDIT COMPLET IDENTIFIANT DES PROBLÈMES CRITIQUES**

---

## 🔴 RÉSUMÉ EXÉCUTIF

| Catégorie | Statut | Détail |
|-----------|--------|--------|
| **Pages analysées** | 14 pages | Dashboard, Mentions, Keywords, Alerts, Reports, Sources, Analysis, Actions, Brands, Settings, Auth (4), Onboarding (7) |
| **Pages cassées** | 🔴 **6 pages** | Actions, Analysis, Brands (partiellement), Reports, Alerts, Sources |
| **Erreurs critiques** | 🔴 **8 erreurs** | Appels API incorrects, gestion d'erreur manquante, réponses mal structurées |
| **Problèmes types** | 🟠 **3 types** | Structure API, typage TypeScript, gestion des états |

---

## 📊 ANALYSE DÉTAILLÉE PAR PAGE

### ✅ PAGES FONCTIONNELLES

#### 1. **Dashboard** (`/src/pages/Dashboard/Dashboard.tsx`)
- ✅ Appels API corrects: `getAnalyticsSummary()`, `getAlerts()`
- ✅ États de chargement/erreur gérés
- ✅ Vérification `isApiError()` présente
- ✅ Affichage conditionnel (loading, error, data)

#### 2. **Mentions** (`/src/pages/Mentions/Mentions.tsx`)
- ✅ Appels API corrects: `getMentions()`, `getKeywords()`
- ✅ Gestion des paramètres: `brandId`, filtres
- ✅ Transformation de données robuste: `transformMention()`
- ✅ Vérification d'erreur avec `isApiError()`

#### 3. **Keywords** (`/src/pages/Keywords/Keywords.tsx`)
- ✅ Appels API: `getKeywords()`
- ✅ Gestion des états CRUD (création, suppression)
- ✅ Erreurs gérées avec try/catch
- ⚠️ Structure de réponse API mal typée (accepte formats multiples)

---

### 🔴 PAGES CASSÉES / À RECONSTRUIRE

#### 1. **❌ Actions** (`/src/pages/Actions/Actions.tsx`)

**Problèmes:**
- 🔴 **Pas d'appel API** - Utilise données mockées statiques (`_actionsData`)
- 🔴 **Pas de chargement des données** - `loading`, `error` jamais initialisés
- 🔴 **Pas de gestion d'erreur** - Aucun try/catch
- 🔴 **États UI manquants** - Pas de loading spinner, empty state
- 🔴 **Pas de synchronisation API** - Les actions ne sont jamais persistées

**Données mockées manquantes:**
```
- Actions en attente (pending)
- Actions en cours (in-progress)
- Actions complétées (completed)
- Assignation aux utilisateurs
```

**Endpoints manquants:**
- `GET /actions` - Récupérer les actions
- `POST /actions` - Créer une action
- `PATCH /actions/:id` - Mettre à jour une action
- `DELETE /actions/:id` - Supprimer une action

---

#### 2. **❌ Analysis** (`/src/pages/Analysis/Analysis.tsx`)

**Problèmes:**
- 🔴 **Pas d'appel API** - Données mockées statiques complètement
- 🔴 **Aucun appel à `getAnalyticsSummary()` ou `getSentimentBreakdown()`**
- 🔴 **Pas de dépendance au brand sélectionné**
- 🔴 **Données codées en dur** - Pas de paramètres dynamiques (dates, brandId)
- 🔴 **Pas d'état de chargement**

**Données mockées non connectées à l'API:**
```
- aiInsightsData (insights IA)
- sentimentData (analyse sentiment)
- timelineData (série temporelle)
- keywordsData (mots-clés tendance)
- influencersData (influenceurs)
- sourcesData (répartition par source)
```

**API à intégrer:**
- `POST /analytics/sentiment-breakdown?brandId=x`
- `POST /analytics/time-series?brandId=x&period=daily`
- `GET /keywords?brandId=x` (pour trending keywords)

---

#### 3. **❌ Alerts** (`/src/pages/Alerts/Alerts.tsx`)

**Problèmes:**
- 🟠 **Appel API présent MAIS mal structuré**
- ⚠️ Le format de réponse est incohérent: `response.data` ou `Array.isArray(response)`
- ⚠️ Pas de vérification `isApiError()` - Risque de crash
- ⚠️ Transformation des données fragile - Accès aux propriétés sans vérification
- 🔴 Pas de `useBrand()` - Alertes chargées sans filtrer par brand

**Endpoint utilisé (INCORRECT):**
```typescript
// Actuellement:
apiClient.getAlerts({ organizationId: user.organizationId })

// Devrait être:
apiClient.getAlerts({ brandId: selectedBrand.id })
```

**Problème structurel:**
```typescript
// Fragile:
const data = response.data || (Array.isArray(response) ? response : []);

// Devrait être:
if (isApiError(response)) throw new Error();
const data = response.data as Alert[];
```

---

#### 4. **❌ Reports** (`/src/pages/Reports/Reports.tsx`)

**Problèmes:**
- ⚠️ **Appel API présent MAIS incohérent**
- ⚠️ Accès `(reportsRes as any).data` - Typage perdu
- ⚠️ Pas de vérification d'erreur appropriée
- 🔴 **Données mockées partielles** - `scheduledReports` en dur
- 🔴 **Pas de synchronisation avec le backend** - Les rapports ne sont jamais persistés
- 🔴 Pas de gestion du statut de génération

**Problème structurel:**
```typescript
// Actuellement (BAD):
const reportsData: Report[] = Array.isArray((reportsRes as any).data) 
  ? ((reportsRes as any).data as Report[]) 
  : [];

// Devrait être (GOOD):
if (isApiError(reportsRes)) {
  setError('Impossible de charger les rapports');
  return;
}
const reportsData = reportsRes.data as Report[];
```

---

#### 5. **🟠 Sources** (`/src/pages/Sources/Sources.tsx`)

**Problèmes:**
- ⚠️ **API appelée mais structure de réponse mal gérée**
- ⚠️ Multiples vérifications de format: `Array.isArray(sourcesRes.data)` ou `(sourcesRes.data as any).data`
- ⚠️ Pas de vérification `isApiError()` avant d'accéder aux données
- 🔴 **Pas de gestion de l'auth token** - Les requêtes peuvent échouer silencieusement

**Problème structure API:**
```typescript
// Incohérent - accepte plusieurs formats:
let sourcesData: Source[] = [];
if (Array.isArray(sourcesRes.data)) {
  sourcesData = sourcesRes.data as Source[];
} else if (sourcesRes.data && Array.isArray((sourcesRes.data as any).data)) {
  sourcesData = (sourcesRes.data as any).data as Source[];
}

// Devrait être standardisé à:
const sourcesData = (sourcesRes.data as Source[]) || [];
```

---

#### 6. **🟠 Brands** (`/src/pages/Brands/Brands.tsx`)

**Problèmes:**
- ⚠️ **Appel API manquant dans le hook `useEffect`**
- ⚠️ Dépend du contexte `contextBrands` mais n'appelle pas l'API directement
- ⚠️ Pas de vérification du statut `response.success`
- 🔴 **Gestion d'erreur incomplète** - Erreurs partiellement gérées

**Problème structurel:**
```typescript
// Actuellement:
if (response.success) {
  setBrands(response.data as Brand[]);
}

// Mais response peut être dans un format différent:
if (isApiError(response)) {
  // Gérer l'erreur correctement
}
```

---

## 🔧 PROBLÈMES STRUCTURELS COMMUNS

### 1. **Incohérence des réponses API**
| Endpoint | Format Réponse | Problème |
|----------|----------------|---------| 
| `getAlerts()` | `{ data: Alert[] }` ou `Alert[]` | Ambiguë |
| `getReports()` | `{ data: Report[] }` | Nécessite cast `as any` |
| `getSources()` | `{ data: [] }` ou `{ data: { data: [] } }` | Imbrication variable |
| `getBrands()` | `{ success, data, error }` | Bon format |

### 2. **Absence de vérification d'erreur uniforme**
```typescript
// ❌ Incohérent à travers l'app:
const data = response.data || [];  // Risqué
const data = (reportsRes as any).data;  // Typage perdu
if (response.success) { }  // Pas standardisé

// ✅ Devrait être:
if (isApiError(response)) {
  setError(response.error.message);
  return;
}
const data = response.data;
```

### 3. **États manquants**
Pages cassées manquent de:
- ❌ État `loading`
- ❌ État `error`
- ❌ État `empty` (aucune donnée)
- ❌ Spinners/loaders visuels
- ❌ Messages d'erreur utilisateur

---

## 📝 PLAN DE RECONSTRUCTION

### Ordre de priorité:
1. **Actions** (complètement manquante) - 🔴 CRITIQUE
2. **Analysis** (complètement manquée) - 🔴 CRITIQUE
3. **Alerts** (structure API incorrecte) - 🟠 IMPORTANT
4. **Reports** (structure API cassée) - 🟠 IMPORTANT
5. **Sources** (structure API incohérente) - 🟠 IMPORTANT
6. **Brands** (typage/erreur incohérent) - 🟡 MOYEN

---

## ✨ PATTERN À APPLIQUER

```typescript
// Template pour tous les appels API:
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchData = useCallback(async () => {
  if (!selectedBrand) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    const response = await apiClient.getEndpoint({ brandId: selectedBrand.id });
    
    // Vérifier les erreurs
    if (isApiError(response)) {
      setError(response.error.message || 'Erreur serveur');
      return;
    }
    
    // Assigner les données
    const fetchedData = response.data as DataType[];
    setData(Array.isArray(fetchedData) ? fetchedData : []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    setError(msg);
  } finally {
    setLoading(false);
  }
}, [selectedBrand]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// Rendu:
if (loading) return <LoadingState />;
if (error) return <ErrorState message={error} />;
if (data.length === 0) return <EmptyState />;
return <DataDisplay data={data} />;
```

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Rapport d'audit généré
2. ⏳ Code reconstruit pour 6 pages (voir fichiers séparés)
3. ⏳ Tests d'intégration API
4. ⏳ Instructions de test complètes

---

## 📞 CONTACTS & NOTES

- **API Base URL:** `http://localhost:5001/api/v1` (à partir de `.env`)
- **Endpoints disponibles:** Consultez `api/src/app.ts`
- **Types:** Voir `apps/web/src/types/api.ts` et `apps/web/src/types/models.ts`
- **Utils API:** `apps/web/src/lib/api-client.ts`
