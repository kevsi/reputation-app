# 🚨 Analyse des Erreurs dans le Projet Web (apps/web)

## Erreurs Critiques Détectées

### 1. **CRASH: `brand.name.toLowerCase()` sur undefined**

**Fichier:** `apps/web/src/pages/Brands/Brands.tsx:76`

```typescript
// ❌ ERREUR: Crash si brand.name est undefined
const filteredBrands = brands.filter(brand =>
  brand.name.toLowerCase().includes(searchQuery.toLowerCase())
);

// ✅ CORRECTION:
const filteredBrands = (brands || []).filter(brand =>
  brand.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
);
```

---

### 2. **CRASH: `res.data.items.map()` sans vérification**

**Fichier:** `apps/web/src/pages/Mentions/Mentions.tsx:122`

```typescript
// ❌ ERREUR: Crash si res.data est null ou si items n'existe pas
if (!isApiError(res) && res.data) {
  setMentions(res.data.items.map(transformMention));
  setTotalItems(res.data.total);
}

// ✅ CORRECTION:
if (!isApiError(res) && res.data) {
  const items = res.data?.items || [];
  setMentions(items.map(transformMention));
  setTotalItems(res.data?.total || 0);
}
```

---

### 3. **Type `any` utilisé unsafe**

**Fichier:** `apps/web/src/pages/Brands/Brands.tsx:33`

```typescript
// ❌ ERREUR: Cast unsafe
setBrands(contextBrands as any);

// ✅ CORRECTION:
setBrands(contextBrands || []);
```

---

### 4. **Appel API sans gestion d'erreur**

**Fichier:** `apps/web/src/pages/Sources/Sources.tsx`

```typescript
// ⚠️ RISQUE: Pas de try-catch autour des appels API
const handleCreateSource = async () => {
  const res = await sourcesService.create(brandId, sourceData);
  // Pas de vérification d'erreur
  toast.success('Source créée');
};
```

---

### 5. **Navigation sans vérification**

**Fichier:** `apps/web/src/pages/Mentions/Mentions.tsx:138-140`

```typescript
// ⚠️ RISQUE: Navigation sans vérifier si selectedBrand existe
useBrandListener(async () => {
  if (selectedBrand && selectedBrand.id !== urlBrandId) {
    navigate(`/mentions/${selectedBrand.id}`);
  }
});
```

---

## Pattern d'Erreurs Répandus

### A. Accès aux propriétés sans null check

```typescript
// ❌ PartOUT dans le code
data.property.nestedProperty

// ✅ PartOUT
data?.property?.nestedProperty
```

### B. Tableaux non vérifiés avant .map()

```typescript
// ❌
items.map(...)

// ✅
(items || []).map(...)
```

### C. Fonctions dans useEffect sans dépendances

```typescript
// ❌
useEffect(() => {
  fetchData();
}, []); // Manque des dépendances

// ✅
useEffect(() => {
  fetchData();
}, [dépendances]);
```

---

## Fichiers avec Erreurs Potentielles

| Fichier | Ligne(s) | Type d'Erreur |
|---------|----------|---------------|
| `Brands/Brands.tsx` | 33, 76, 120 | undefined, any |
| `Mentions/Mentions.tsx` | 122, 234 | undefined items |
| `Alerts/Alerts.tsx` | 92-93 | undefined mapping |
| `Keywords/Keywords.tsx` | 204 | undefined key |
| `Reports/Reports.tsx` | 141, 178, 241 | undefined arrays |
| `Actions/Actions.tsx` | 160, 181, 202 | undefined arrays |

---

## Corrections Prioritaires

### Correction 1: Brands.tsx

```typescript
// Line 33
useEffect(() => {
  setBrands(contextBrands || []);
  setIsLoading(false);
}, [contextBrands]);

// Line 75-77
const filteredBrands = (brands || []).filter(brand =>
  brand.name?.toLowerCase()?.includes(searchQuery?.toLowerCase() || '') ?? false
);
```

### Correction 2: Mentions.tsx

```typescript
// Line 121-127
if (!isApiError(res) && res.data) {
  const items = res.data?.items || [];
  const total = res.data?.total ?? 0;
  setMentions(items.map(transformMention));
  setTotalItems(total);
  setTotalPages(res.data?.totalPages || Math.ceil(total / pageSize));
}
```

---

## Recommandations

1. **Activer le mode strict TypeScript** dans `tsconfig.json`
2. **Ajouter ESLint** avec règles:
   - `no-unused-vars`
   - `no-any`
   - `prefer-optional-chain`
3. **Utiliser le hook `useApi`** créé pour gérer les états automatiquement
4. **Ajouter des tests** pour les cas limites (null, undefined, arrays vides)

---

## Score de Qualité Actuel

| Métrique | Score |
|----------|-------|
| Null Safety | 5/10 |
| Type Safety | 6/10 |
| Error Handling | 7/10 |
| Code Coverage | N/A |

**Score Global: 6/10**
