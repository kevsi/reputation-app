# 📋 Plan d'Implémentation : Refactoring Système de Collectors

## 📊 Analyse du Code Existant

### État Actuel
✅ **Points forts :**
- Bonne architecture avec Factory pattern dans `base.collector.ts`
- Interface claire (`ICollector`, `BaseCollector`)
- Lazy loading des collectors via `ensureCollectorsRegistered()`
- Support de nombreuses sources (Twitter, Reddit, YouTube, Facebook, Google Reviews, Web, Trustpilot)

❌ **Problèmes identifiés :**
1. **Pas de gestion des collectors désactivés** : Trustpilot et NEWS sont chargés sans vérification
2. **Pas de validation du type** : `getCollector()` lance une erreur générique si non trouvé
3. **Config hardcodée** : Les collectors sont enregistrés dans `ensureCollectorsRegistered()` sans centralisation
4. **Messages d'erreur peu explicites** : Pas de raison fournie pour les collectors manquants
5. **Pas de logging au démarrage** : Impossible de savoir quels collectors sont disponibles

### Architecture Actuelle
```
base.collector.ts
├── ICollector (interface)
├── BaseCollector (classe abstraite)
└── CollectorFactory
    ├── register(type, class)
    ├── getCollector(type) ← PROBLÈME: pas de validation
    ├── getAvailableCollectors()
    └── ensureCollectorsRegistered() ← PROBLÈME: hardcodé, pas de config

collectors/index.ts
└── Exports uniquement (pas d'enregistrement)

scraping.processor.ts
└── Appelle CollectorFactory.getCollector() sans validation précoce
```

---

## 🎯 Plan d'Implémentation (6 Étapes)

### **Étape 1 : Créer Configuration Centralisée**
**Fichier :** `src/config/collectors.config.ts`

**Objectifs :**
- Définir tous les collectors disponibles avec leur statut
- Fournir des raisons pour les collectors désactivés
- Exporter des utilitaires type-safe

**Structure :**
```typescript
export const AVAILABLE_COLLECTORS = {
  REDDIT: { enabled: true, reason: null },
  TWITTER: { enabled: true, reason: null },
  YOUTUBE: { enabled: true, reason: null },
  FACEBOOK: { enabled: true, reason: null },
  GOOGLE_REVIEWS: { enabled: true, reason: null },
  FORUM: { enabled: true, reason: null },  // WebCollector
  BLOG: { enabled: true, reason: null },   // WebCollector
  REVIEW: { enabled: true, reason: null }, // WebCollector
  NEWS: { enabled: false, reason: 'Collector not implemented yet' },
  TRUSTPILOT: { enabled: false, reason: 'Violates ToS - Use official API' }
}
```

**Fonctions utilitaires :**
- `isCollectorEnabled(type)` → boolean
- `getCollectorReason(type)` → string | null
- `getAvailableCollectorTypes()` → array

---

### **Étape 2 : Refactoriser CollectorFactory**
**Fichier :** `src/collectors/base.collector.ts`

**Modifications :**
1. Importer la config centralisée
2. Modifier `register()` pour vérifier si le collector est activé
3. Améliorer `getCollector()` avec validation précoce
4. Ajouter logging détaillé
5. Créer méthode `initialize()` pour l'enregistrement des collectors

**Nouvelles méthodes :**
- `initialize()` : Enregistre les collectors basé sur config
- `isTypeValid(type)` : Vérifie si type existe dans config
- `isTypeEnabled(type)` : Vérifie si collector est activé

---

### **Étape 3 : Auto-enregistrement Conditionnel**
**Fichier :** `src/collectors/index.ts`

**Modifications :**
1. Importer `CollectorFactory.initialize()`
2. Appeler au module load
3. Importer tous les collectors conditionnellement
4. Enregistrer uniquement si activé

**Pattern :**
```typescript
CollectorFactory.initialize();
export { CollectorFactory };
```

---

### **Étape 4 : Améliorer Scraping Processor**
**Fichier :** `src/processors/scraping.processor.ts`

**Modifications :**
1. Ajouter validation précoce après chargement de la source
2. Importer `isCollectorEnabled` et `getCollectorReason`
3. Lancer erreur explicite si collector désactivé
4. Ajouter logging des étapes

**Nouvelle validation (après charger source) :**
```typescript
if (!isCollectorEnabled(source.type)) {
  const reason = getCollectorReason(source.type);
  throw new Error(
    `Collector ${source.type} is disabled: ${reason || 'Unknown reason'}`
  );
}
```

---

### **Étape 5 : Créer Squelette NEWS Collector (optionnel)**
**Fichier :** `src/collectors/news.collector.ts`

**Contenu :**
```typescript
export class NewsCollector extends BaseCollector {
  async collect(source: Source, keywords: string[]): Promise<RawMention[]> {
    console.log('📰 News collector - Not implemented yet');
    return [];
  }
  
  async testConnection() { return { success: false, message: 'Not implemented' }; }
}
```

---

### **Étape 6 : Créer Script de Validation (optionnel)**
**Fichier :** `src/scripts/validate-sources.ts`

**Objectifs :**
- Identifier les sources utilisant des collectors désactivés
- Avertir l'administrateur
- Proposer correction automatique (optionnel)

---

## 🔄 Flux d'Exécution Attendu

### Au Démarrage
```
✅ CollectorFactory initializing...
✅ Registered collector: REDDIT
✅ Registered collector: TWITTER
✅ Registered collector: YOUTUBE
✅ Registered collector: FACEBOOK
✅ Registered collector: GOOGLE_REVIEWS
✅ Registered collector: FORUM (WebCollector)
✅ Registered collector: BLOG (WebCollector)
✅ Registered collector: REVIEW (WebCollector)
⏭️ Collector TRUSTPILOT is disabled (Violates ToS - Use official API)
⏭️ Collector NEWS is disabled (Collector not implemented yet)
✅ Collectors initialization complete
```

### En Cas d'Erreur
```
❌ Collector TRUSTPILOT is disabled: Violates ToS - Use official API
Error thrown to BullMQ for retry/failure handling
```

---

## 📦 Dépendances de Fichiers

```
collectors.config.ts
    ↓
base.collector.ts (CollectorFactory)
    ↓
collectors/index.ts (auto-registration)
    ↓
scraping.processor.ts (utilisation)
    ↓
(optionnel) scripts/validate-sources.ts
```

---

## ✅ Critères de Succès

1. ✅ Config centralisée et type-safe
2. ✅ Auto-enregistrement conditionnel au démarrage
3. ✅ Messages d'erreur explicites avec raison
4. ✅ Logging clair des collectors disponibles
5. ✅ TypeScript strict mode
6. ✅ Pas de modification Prisma schema
7. ✅ Compatible BullMQ
8. ✅ Code maintenable et documenté

---

## 🚀 Ordre d'Exécution Recommandé

1. **Étape 1** : Créer `collectors.config.ts` (config centralisée)
2. **Étape 2** : Refactoriser `base.collector.ts` (CollectorFactory)
3. **Étape 3** : Mettre à jour `collectors/index.ts` (auto-registration)
4. **Étape 4** : Améliorer `scraping.processor.ts` (validation précoce)
5. **Étape 5** : Créer `news.collector.ts` (squelette)
6. **Étape 6** : Créer `scripts/validate-sources.ts` (optionnel)

**Temps estimé :** 1-2 heures pour implémentation complète

---

## 🔧 Points Techniques Importants

### Type Safety
- Utiliser `as const` pour `AVAILABLE_COLLECTORS`
- Exporter type `CollectorType = keyof typeof AVAILABLE_COLLECTORS`
- Éviter les string literals

### Logging Strategy
- `console.info()` pour info normales
- `console.warn()` pour warnings (collectors disabled)
- `console.error()` pour erreurs
- Horodatage et contexte clair

### Error Handling
- Custom error messages avec raison spécifique
- Stack traces complètes pour debugging
- Intégration BullMQ avec retry/failure

### Performance
- Lazy loading conservé (pas de regréssion)
- Enregistrement au module load (une seule fois)
- Pas de I/O lors des enregistrements

