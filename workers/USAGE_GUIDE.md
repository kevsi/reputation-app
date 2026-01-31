# 🚀 Guide d'Utilisation - Système de Collectors Refactorisé

## 📦 Structure Globale

```
src/
├── config/
│   └── collectors.config.ts          ← 🎯 Configuration centralisée
├── collectors/
│   ├── base.collector.ts              ← 🏗️ Factory refactorisée
│   ├── index.ts                       ← 🚀 Auto-registration
│   ├── reddit.collector.ts
│   ├── twitter.collector.ts
│   ├── youtube.collector.ts
│   ├── facebook.collector.ts
│   ├── google_reviews.collector.ts
│   ├── web.collector.ts
│   ├── trustpilot.collector.ts        ← 🔒 Désactivé
│   └── news.collector.ts              ← 📰 Squelette
├── processors/
│   └── scraping.processor.ts          ← ✅ Validation précoce
└── scripts/
    └── validate-sources.ts            ← 📊 Validation DB
```

---

## ✅ Démarrage et Initialisation

### 1. Au Démarrage de l'Application

Quand `src/collectors/index.ts` est importé, le système effectue automatiquement :

```
✅ CollectorFactory.initialize()
✅ Enregistrement conditionnel de chaque collector
✅ Logging détaillé de chaque étape
```

**Output attendu :**
```
✅ CollectorFactory initializing...
📊 Found 8 enabled collectors, 2 disabled
⏭️  Collector NEWS is disabled: Collector not implemented yet
⏭️  Collector TRUSTPILOT is disabled: Violates Trustpilot ToS
✅ Registered collector: REDDIT
✅ Registered collector: TWITTER
✅ Registered collector: YOUTUBE
✅ Registered collector: FACEBOOK
✅ Registered collector: GOOGLE_REVIEWS
✅ Registered collector: FORUM
✅ Registered collector: BLOG
✅ Registered collector: REVIEW
```

---

## 🔧 Configuration des Collectors

### Activer/Désactiver un Collector

Modifier `src/config/collectors.config.ts` :

```typescript
TRUSTPILOT: {
  enabled: false,  // ← Changer à true pour activer
  reason: 'Violates Trustpilot ToS - Use official API instead'
}
```

Puis dans `src/collectors/index.ts`, décommenter :

```typescript
// Uncomment to enable TRUSTPILOT
if (isCollectorEnabled('TRUSTPILOT')) {
  CollectorFactory.registerCollector('TRUSTPILOT', TrustpilotCollector);
}
```

Redémarrer l'application pour appliquer les changements.

### Ajouter un Nouveau Collector

**Étape 1 :** Créer la classe collector

```typescript
// src/collectors/custom.collector.ts
export class CustomCollector extends BaseCollector {
  async collect(source: Source, keywords: string[]): Promise<RawMention[]> {
    // Implementation
  }

  async testConnection(config: any) {
    // Implementation
  }
}
```

**Étape 2 :** Ajouter à la configuration

```typescript
// src/config/collectors.config.ts
export const AVAILABLE_COLLECTORS = {
  // ...
  CUSTOM: {
    enabled: true,
    reason: null
  }
}
```

**Étape 3 :** Enregistrer le collector

```typescript
// src/collectors/index.ts
import { CustomCollector } from './custom.collector';

if (isCollectorEnabled('CUSTOM')) {
  CollectorFactory.registerCollector('CUSTOM', CustomCollector);
}
```

---

## 📊 Utilisation dans le Code

### Obtenir un Collector

```typescript
import { CollectorFactory } from '../collectors';

try {
  const collector = CollectorFactory.getCollector('REDDIT');
  const mentions = await collector.collect(source, keywords);
} catch (error) {
  console.error(error); // Message d'erreur clair avec raison
}
```

### Vérifier si un Collector est Activé

```typescript
import { isCollectorEnabled, getCollectorReason } from '../config/collectors.config';

if (isCollectorEnabled('TRUSTPILOT')) {
  // Utiliser TRUSTPILOT
} else {
  const reason = getCollectorReason('TRUSTPILOT');
  console.log(`TRUSTPILOT is disabled: ${reason}`);
}
```

### Lister les Collectors Disponibles

```typescript
import { getEnabledCollectorTypes, getDisabledCollectorTypes } from '../config/collectors.config';

const enabled = getEnabledCollectorTypes();
const disabled = getDisabledCollectorTypes();

console.log('Enabled:', enabled);   // ['REDDIT', 'TWITTER', ...]
console.log('Disabled:', disabled); // ['TRUSTPILOT', 'NEWS']
```

---

## 🕵️ Scraping avec Validation

Dans `src/processors/scraping.processor.ts`, la validation est automatique :

```typescript
// Validation précoce du collector
if (!isValidCollectorType(source.type)) {
  throw new Error(`Invalid collector type: ${source.type}`);
}

if (!isCollectorEnabled(source.type)) {
  const reason = getCollectorReason(source.type);
  throw new Error(`Collector ${source.type} is disabled: ${reason}`);
}

// Ensuite, obtenir le collector
const collector = CollectorFactory.getCollector(source.type);
```

---

## 📋 Script de Validation des Sources

Identifier les sources en DB avec des collectors désactivés :

### Voir le rapport

```bash
npx ts-node src/scripts/validate-sources.ts
```

**Output :**
```
🔍 Validating sources in database...
📊 Total sources found: 42

📋 VALIDATION RESULTS

✅ Valid sources: 40
⚠️  Sources with disabled collectors: 2
❌ Sources with invalid types: 0

⏭️  DISABLED COLLECTORS:
────────────────────────────────────────────────────────────────────────────────
  ID: source-123
  Type: TRUSTPILOT
  Name: Trustpilot Reviews
  Status: ACTIVE
  Reason: Violates Trustpilot ToS - Use official API instead

  ID: source-456
  Type: NEWS
  Name: News Feed
  Status: ACTIVE
  Reason: Collector not implemented yet

💡 RECOMMENDATIONS:
  • 2 source(s) use disabled collectors
    Run with --fix to deactivate them automatically
    Run with --delete-disabled to remove them completely
```

### Désactiver Automatiquement

```bash
npx ts-node src/scripts/validate-sources.ts --fix
```

Cela va changer `isActive: true` à `isActive: false` pour toutes les sources avec collectors désactivés.

### Supprimer les Sources Problématiques

```bash
npx ts-node src/scripts/validate-sources.ts --delete-disabled
```

⚠️ **ATTENTION :** Cette commande supprime définitivement les sources.

---

## 🧪 Tester la Configuration

### Test 1 : Vérifier l'Initialisation

Créer un fichier de test simple :

```typescript
// test-collectors.ts
import { CollectorFactory } from './src/collectors';
import { getEnabledCollectorTypes } from './src/config/collectors.config';

console.log('Enabled collectors:', getEnabledCollectorTypes());
console.log('Available collectors:', CollectorFactory.getAvailableCollectors());
```

Exécuter :
```bash
npx ts-node test-collectors.ts
```

### Test 2 : Obtenir un Collector

```typescript
try {
  const collector = CollectorFactory.getCollector('REDDIT');
  console.log('✅ Got REDDIT collector');
} catch (error) {
  console.error('❌', error.message);
}
```

### Test 3 : Essayer un Collector Désactivé

```typescript
try {
  const collector = CollectorFactory.getCollector('TRUSTPILOT');
  console.log('✅ Got TRUSTPILOT collector');
} catch (error) {
  console.error('❌', error.message);
  // Output: ❌ Collector TRUSTPILOT is disabled: Violates Trustpilot ToS
}
```

---

## 🎯 Bonnes Pratiques

### ✅ À Faire

```typescript
// ✅ Vérifier avant d'utiliser
if (isCollectorEnabled('CUSTOM_COLLECTOR')) {
  const collector = CollectorFactory.getCollector('CUSTOM_COLLECTOR');
}

// ✅ Gérer les erreurs explicitement
try {
  const collector = CollectorFactory.getCollector(source.type);
} catch (error) {
  if (error.message.includes('disabled')) {
    // Collector est désactivé - log et skip
  } else {
    // Autre erreur - retry
  }
}

// ✅ Utiliser les types TypeScript
import type { CollectorType } from '../config/collectors.config';
function process(type: CollectorType) { ... }
```

### ❌ À Éviter

```typescript
// ❌ Ne pas utiliser de string literals
const type: any = 'TRUSTPILOT'; // Perd la validation
const collector = CollectorFactory.getCollector(type);

// ❌ Ne pas ignorer les erreurs
const collector = CollectorFactory.getCollector('ANYTHING');

// ❌ Ne pas modifier AVAILABLE_COLLECTORS directement
AVAILABLE_COLLECTORS.REDDIT.enabled = false; // Non ! Utiliser la config
```

---

## 📚 Types TypeScript Disponibles

```typescript
import {
  CollectorType,              // Type union de tous les collector types
  CollectorConfigEntry,       // Interface pour config d'un collector
  isCollectorEnabled,         // (type: CollectorType) => boolean
  getCollectorReason,         // (type: CollectorType) => string | null
  getEnabledCollectorTypes,   // () => CollectorType[]
  getDisabledCollectorTypes,  // () => CollectorType[]
  getCollectorConfig,         // (type: CollectorType) => ConfigEntry | undefined
  isValidCollectorType,       // (type: string) => type is CollectorType
  getUnavailableCollectorMessage // (type: string) => string
} from '../config/collectors.config';
```

---

## 🐛 Dépannage

### Q: Un collector n'est pas enregistré
**A:** Vérifier que :
1. Le collector est activé dans `collectors.config.ts`
2. Le collector est enregistré dans `collectors/index.ts`
3. Redémarrer l'application

### Q: Message d'erreur peu clair
**A:** Tous les messages doivent suivre le format :
```
❌ Collector {TYPE} is disabled: {REASON}
```

### Q: Je veux ajouter un nouveau collector
**A:** Suivre les 3 étapes dans la section "Ajouter un Nouveau Collector"

### Q: Qu'est-ce que l'erreur "Type is not valid"?
**A:** Le type de collector n'existe pas dans `collectors.config.ts`. Vérifier l'orthographe et la casse.

---

## 📞 Support

Pour toute question sur le système de collectors :

1. Consulter `src/config/collectors.config.ts` pour la config
2. Consulter `src/collectors/base.collector.ts` pour la Factory
3. Consulter les commentaires détaillés dans chaque fichier
4. Exécuter `npx ts-node src/scripts/validate-sources.ts` pour diagnostiquer

