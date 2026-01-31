## 🛠️ Système de Gestion des Collectors - Documentation Complète

### 📋 Vue d'ensemble

Ce système implement une **architecture robuste et professionnelle** pour la gestion des collecteurs de données (collectors) dans le système Sentinelle Reputation. Il fournit:

✅ Configuration centralisée des collectors  
✅ Validation stricte des sources au moment de la scraping  
✅ Auto-désactivation des sources utilisant des collectors interdits  
✅ Scripts de monitoring et de gestion  
✅ Messages d'erreur clairs avec suggestions alternatives  

---

### 🏗️ Architecture Implantée

#### PHASE 1: Configuration Centralisée
**Fichier**: `src/config/collectors.config.ts`

Définit une **source unique de vérité** pour tous les collectors:

```typescript
export const AVAILABLE_COLLECTORS = {
  // ✅ ACTIVÉS (9 collectors)
  REDDIT: { enabled: true, requiresAuth: true, ... },
  TWITTER: { enabled: true, requiresAuth: true, ... },
  YOUTUBE: { enabled: true, ... },
  FACEBOOK: { enabled: true, ... },
  GOOGLE_REVIEWS: { enabled: true, ... },
  FORUM: { enabled: true, ... },
  BLOG: { enabled: true, ... },
  REVIEW: { enabled: true, ... },
  NEWS: { enabled: true, ... },
  
  // 🚫 DÉSACTIVÉS (1 collector)
  TRUSTPILOT: {
    enabled: false,
    reason: 'Violates Trustpilot Terms of Service (scraping is prohibited)',
    alternative: 'Use Trustpilot Business API with official partnership'
  }
}
```

**Propriétés de chaque collector**:
- `enabled`: boolean - État du collector
- `requiresAuth?`: boolean - Nécessite authentification
- `rateLimit?`: { requests: number; per: 'minute'|'hour'|'day' }
- `description?`: string - Description du collector
- `reason?`: string - Raison de la désactivation (si `enabled: false`)
- `alternative?`: string - API alternative recommandée

**Fonctions utilitaires**:
```typescript
isCollectorEnabled(type: string): boolean
getCollectorReason(type: CollectorType): string | null
getEnabledCollectorTypes(): CollectorType[]
getDisabledCollectorTypes(): Array<{type, reason, alternative}>
isValidCollectorType(type: string): boolean
getUnavailableCollectorMessage(type: string): string
```

---

#### PHASE 2: Factory Pattern Amélioré
**Fichier**: `src/collectors/base.collector.ts`

Refactorisation du `CollectorFactory`:

```typescript
class CollectorFactory {
  // Initialisation et enregistrement
  static initialize(): void
  static registerCollector(type: string, collector: ICollector): boolean
  
  // Récupération des collectors
  static getCollector(type: string): ICollector
  
  // Information et monitoring
  static getRegisteredCollectors(): string[]
  static isRegistered(type: string): boolean
  static getCollectorInfo(type: string): CollectorInfo | null
  static getEnabledCollectorsList(): CollectorInfo[]
  static getDisabledCollectorTypes(): DisabledCollectorInfo[]
}
```

**Comportement**:
- Valide strictement que le collector est activé avant de le retourner
- Messages d'erreur détaillés incluant alternatives
- Logging du statut à l'initialisation

---

#### PHASE 3: Auto-enregistrement Conditionnel
**Fichier**: `src/collectors/index.ts`

À l'import du module:
1. Appelle `CollectorFactory.initialize()` pour le logging
2. Enregistre **uniquement** les collectors activés (9 sur 10)
3. Log un résumé du statut

```typescript
// À l'import:
// ✅ Collectors registered: 9
//    REDDIT, TWITTER, YOUTUBE, FACEBOOK, GOOGLE_REVIEWS, 
//    FORUM, BLOG, REVIEW, NEWS
// 🚫 Skipped (disabled): TRUSTPILOT
```

---

#### PHASE 4: Validation en Scraping
**Fichier**: `src/processors/scraping.processor.ts`

**Processus complet de validation**:

```
1. CHARGER LA SOURCE ✓
   ↓
2. VALIDER (forbidden-domains) ✓
   ↓
3. VÉRIFIER TYPE VALIDE
   ├─ Si invalide: Erreur + message
   └─ Sinon: Continuer
   ↓
4. VÉRIFIER COLLECTOR ACTIVÉ
   ├─ Si désactivé:
   │  ├─ AUTO-DÉSACTIVER LA SOURCE dans la BD
   │  ├─ Enregistrer isActive = false
   │  └─ Jeter erreur avec raison + alternative
   └─ Sinon: Continuer
   ↓
5. SCRAPER NORMALEMENT
```

**Auto-désactivation**:
```typescript
if (!isCollectorEnabled(source.type)) {
  const reason = getCollectorReason(source.type as any)
  
  // ⚠️ AUTO-DÉSACTIVER
  await prisma.source.update({
    where: { id: sourceId },
    data: { isActive: false }
  })
  
  throw new Error(`Collector "${type}" is disabled: ${reason}...`)
}
```

---

#### PHASE 5A: Script de Gestion
**Fichier**: `src/scripts/manage-sources.ts`

Script complet de gestion des sources.

**Usage**:
```bash
# Afficher le statut
npx ts-node src/scripts/manage-sources.ts

# Auto-désactiver les sources avec collectors interdits
npx ts-node src/scripts/manage-sources.ts --deactivate

# Rapport détaillé
npx ts-node src/scripts/manage-sources.ts --report
```

**Fonctionnalités**:
- Scan complet des sources en BD
- Identification des sources avec collectors:
  - ✅ Valides et activées
  - 🚫 Désactivés/interdits
  - ❓ Type inconnu
- Auto-désactivation des sources problématiques
- Rapport détaillé avec raison et alternatives
- Suggestions d'actions

**Exemple de sortie**:
```
╔═══════════════════════════════════════╗
║     SOURCE INVENTORY SUMMARY          ║
╚═══════════════════════════════════════╝

  📊 Total sources:        15
  ✅ Active:               12
  ⏸️  Inactive:             3

  Collector Status:
    ✅ Valid & enabled:    12
    🚫 Forbidden/disabled: 2
    ❓ Unknown type:       0

  ⚠️  Issues:
    🚫 Active sources with disabled collectors: 2

💡 Run with --deactivate to automatically fix these issues
```

---

#### PHASE 5B: Script de Monitoring
**Fichier**: `src/scripts/check-collectors.ts`

Script de vérification du statut des collectors.

**Usage**:
```bash
npx ts-node src/scripts/check-collectors.ts
```

**Affichage**:
1. Table récapulative des collectors (enabled/disabled)
2. Statut du registre (registered vs not registered)
3. Informations détaillées par collector
4. Résumé santé du système avec recommandations

**Exemple de sortie**:
```
✅ ENABLED COLLECTORS:

  Type              Status       Rate Limit          Auth     Description
  ─────────────────────────────────────────────────────────────────────────
  REDDIT            ✓ Registered 60/minute           Yes      Collecte depuis Reddit API
  TWITTER           ✓ Registered 100/minute          Yes      Collecte depuis Twitter/X API
  YOUTUBE           ✓ Registered 10000/day           Yes      Collecte de commentaires YouTube
  ...

🚫 DISABLED COLLECTORS:

  Type              Reason                           Alternative
  ────────────────────────────────────────────────────────────────────
  TRUSTPILOT        Violates Terms of Service        Use Trustpilot Business API with official partnership
```

---

### 🔄 Flux de Fonctionnement

#### Cas 1: Source avec collector activé (REDDIT)
```
Source créée avec type=REDDIT
    ↓
Validation en scraping
    ├─ Type valide? OUI ✓
    └─ Collector activé? OUI ✓
    ↓
SCRAPER NORMALEMENT
    ↓
Mentions collectées et traitées
```

#### Cas 2: Source existante avec collector désactivé (TRUSTPILOT)
```
Source existante avec type=TRUSTPILOT, isActive=true
    ↓
Job de scraping lancé
    ↓
Validation en scraping
    ├─ Type valide? OUI ✓
    └─ Collector activé? NON ✗
    ↓
AUTO-DÉSACTIVER: UPDATE source SET isActive=false
    ↓
ERREUR: "Collector TRUSTPILOT is disabled: Violates Terms of Service
         Alternative: Use Trustpilot Business API..."
    ↓
Job échec (retry avec BullMQ)
    ↓
Source désactivée, ne sera plus requêtée
```

#### Cas 3: Cleanup avec manage-sources.ts
```
Lancer: npx ts-node src/scripts/manage-sources.ts --deactivate
    ↓
Scan BD pour sources avec collectors désactivés
    ↓
Trouver 2 sources TRUSTPILOT activées
    ↓
UPDATE source SET isActive=false pour chaque
    ↓
Rapport: "✅ Deactivated 2 sources"
```

---

### 📊 Configuration des Collectors

#### Collectors Activés (9):

| Type | Auth | Rate Limit | Description |
|------|------|-----------|-------------|
| **REDDIT** | ✓ Oui | 60/min | API Reddit |
| **TWITTER** | ✓ Oui | 100/min | API Twitter/X |
| **YOUTUBE** | ✓ Oui | 10000/day | Commentaires YouTube |
| **FACEBOOK** | ✓ Oui | 200/hour | API Facebook Graph |
| **GOOGLE_REVIEWS** | Non | 100/hour | Google My Business |
| **FORUM** | Non | 1000/hour | Scraping web (forums) |
| **BLOG** | Non | 1000/hour | Scraping web (blogs) |
| **REVIEW** | Non | 1000/hour | Scraping web (reviews) |
| **NEWS** | Non | 100/hour | Articles de presse |

#### Collectors Désactivés (1):

| Type | Raison | Alternative |
|------|--------|------------|
| **TRUSTPILOT** | Violates ToS (scraping prohibited) | Official Trustpilot Business API with partnership |

---

### 🚨 Gestion des Erreurs

#### Message d'erreur complet (TRUSTPILOT):

```
🚫 Collector "TRUSTPILOT" is disabled: Violates Trustpilot Terms of Service (scraping is prohibited)
   Source 5f8a3c... has been automatically deactivated.
   👉 Alternative: Use Trustpilot Business API with official partnership (https://business.trustpilot.com)
```

---

### 🔧 Intégration dans le Codebase

#### 1. Lors de l'import du module collectors
```typescript
import { CollectorFactory } from './collectors'

// À ce moment:
// - CollectorFactory.initialize() est appelé
// - Les 9 collectors activés sont enregistrés
// - Logging du statut
```

#### 2. Dans le processeur de scraping
```typescript
import { 
  isCollectorEnabled, 
  getCollectorReason,
  isValidCollectorType 
} from '../config/collectors.config'

// Validation à la ligne 60-90 de scraping.processor.ts
if (!isCollectorEnabled(source.type)) {
  // Auto-désactiver + erreur
}
```

#### 3. Scripts de management
```bash
# Utilisation directe:
npx ts-node src/scripts/manage-sources.ts --deactivate
npx ts-node src/scripts/check-collectors.ts
```

---

### 📈 Avantages

✅ **Configuration unique** : Source unique de vérité, pas de duplication  
✅ **Validation stricte** : Validée à la création et à l'exécution  
✅ **Auto-healing** : Les sources problématiques se désactivent automatiquement  
✅ **Messages clairs** : Les raisons et alternatives sont explicitées  
✅ **Monitoring** : Scripts pour vérifier l'état du système  
✅ **Traçabilité** : Logs détaillés de ce qui se passe  
✅ **Maintenance facile** : Ajouter/désactiver un collector = 1 changement dans config  

---

### 🛠️ Ajouter/Modifier un Collector

#### Ajouter un nouveau collector activé:
```typescript
// src/config/collectors.config.ts
export const AVAILABLE_COLLECTORS = {
  // ... existing
  LINKEDIN: {
    enabled: true,
    requiresAuth: true,
    rateLimit: { requests: 100, per: 'hour' },
    description: 'Collecte depuis LinkedIn API'
  }
}

// src/collectors/index.ts - enregistrement auto si activé
// Sinon: créer src/collectors/linkedin.collector.ts
```

#### Désactiver un collector:
```typescript
// src/config/collectors.config.ts
TRUSTPILOT: {
  enabled: false,
  reason: 'Violates Terms of Service',
  alternative: 'Use Trustpilot Business API'
}

// Résultat:
// - Plus enregistré au démarrage
// - Sources existantes auto-désactivées au prochain scraping
// - Messages clairs avec alternative
```

---

### 📝 Logs et Debugging

#### Startup logging:
```
🏭 Initializing CollectorFactory...
✅ Collectors registered: 9
   REDDIT, TWITTER, YOUTUBE, FACEBOOK, GOOGLE_REVIEWS, FORUM, BLOG, REVIEW, NEWS
🚫 Skipped (disabled): TRUSTPILOT
   Reason: Violates Trustpilot Terms of Service (scraping is prohibited)
   Alternative: Use Trustpilot Business API with official partnership
```

#### Scraping error logging:
```
🚫 Collector "TRUSTPILOT" is disabled: Violates Trustpilot Terms of Service...
   Source 5f8a3c... has been automatically deactivated.
```

---

### ✅ Tests & Validation

```bash
# Vérifier TypeScript
npx tsc --noEmit

# Vérifier les collectors
npx ts-node src/scripts/check-collectors.ts

# Vérifier les sources
npx ts-node src/scripts/manage-sources.ts

# Auto-fix sources problématiques
npx ts-node src/scripts/manage-sources.ts --deactivate
```

---

### 📚 Fichiers Créés/Modifiés

| Fichier | Statut | Description |
|---------|--------|-------------|
| `src/config/collectors.config.ts` | Créé/Modifié | Configuration centralisée |
| `src/collectors/base.collector.ts` | Modifié | Factory amélioré |
| `src/collectors/index.ts` | Modifié | Auto-enregistrement |
| `src/processors/scraping.processor.ts` | Modifié | Validation + auto-désactivation |
| `src/scripts/manage-sources.ts` | Créé | Gestion des sources |
| `src/scripts/check-collectors.ts` | Créé | Monitoring |

---

### 🎯 Conclusion

Ce système implementé fournit une **gestion professionnelle et robuste** des collectors avec:
- Configuration centralisée
- Validation stricte
- Auto-healing des sources problématiques
- Monitoring complet
- Messages clairs pour la maintenance

Le problème original (TRUSTPILOT causant des erreurs répétées) est résolu via l'auto-désactivation et peut être nettoyé avec `manage-sources.ts --deactivate`.
