# 🔍 SourceAnalyzer - Module d'Analyse Automatique des Sources

Un module robuste et extensible pour analyser automatiquement les URLs et déterminer la meilleure stratégie de collecte de mentions.

## 🎯 Objectifs

- **Analyser** automatiquement une URL pour déterminer sa scrappabilité
- **Détecter** les blocages (Cloudflare, reCAPTCHA, WAF, JavaScript-only)
- **Recommander** la meilleure stratégie de collecte
- **Créer** automatiquement des sources sans intervention manuelle
- **Logger** chaque étape pour un debugging facile
- **Respecter** la légalité (robots.txt, pas de contournement)

## 📋 Stratégies Supportées

### 1. **SCRAPABLE** ✅
L'URL peut être scrappée directement avec Cheerio/Playwright.

**Conditions:**
- HTML valide disponible
- Pas de blocage détecté
- robots.txt permet le scraping
- Pas JavaScript-only

**Exemple:**
```json
{
  "strategy": "SCRAPABLE",
  "message": "Cette source peut être scrappée directement.",
  "suggestedSourceType": "BLOG",
  "suggestedConfig": {
    "url": "https://...",
    "scrapingFrequency": 21600
  }
}
```

### 2. **GOOGLE_SEARCH** 🔍
L'URL doit passer par Google Search API.

**Conditions:**
- Source bloquée (Cloudflare, reCAPTCHA, WAF)
- robots.txt refuse le scraping
- Contenu entièrement JavaScript
- Page inaccessible via Cheerio

**Raisons possibles:**
```
- blockageType: CLOUDFLARE
- blockageType: RECAPTCHA
- blockageType: WAF
- isJavaScriptOnly: true
- robotsAllowScraping: false
```

### 3. **API_REQUIRED** 🔑
L'URL nécessite une clé API valide.

**Conditions:**
- Content-Type: application/json
- Endpoint d'API détecté
- Authentification requise

### 4. **UNSUPPORTED** ❌
L'URL n'est pas supportée ou inaccessible.

**Conditions:**
- URL invalide
- Ressource non trouvée (404)
- Serveur inaccessible
- Contenu vide

---

## 🔧 Installation

```bash
# Installer les dépendances
npm install axios p-retry

# TypeScript strict mode est activé
npm install --save-dev typescript
```

## 🚀 Utilisation

### Utilisation Directe

```typescript
import SourceAnalyzer from './source-analyzer';

const analyzer = new SourceAnalyzer({
  timeout: 10000,
  maxRetries: 2
});

const diagnostic = await analyzer.analyze('https://example.com');

console.log('Stratégie:', diagnostic.strategy);
console.log('Message:', diagnostic.message);
console.log('Recommandations:', diagnostic.recommendations);
console.log('Logs détaillés:', diagnostic.logs);
```

### Via le Service

```typescript
import SourceAnalyzerService from './source-analyzer.service';
import { PrismaClient } from '@sentinelle/database';
import logger from './logger';

const prisma = new PrismaClient();
const service = new SourceAnalyzerService(prisma, logger);

const result = await service.analyzeUrl('https://example.com');

// Créer automatiquement une source si possible
if (!result.requiresUserAction) {
  const source = await service.createSourceFromDiagnostic(
    result.diagnostic,
    brandId,
    organizationId
  );
}
```

### Via API REST

```bash
# Analyser une URL
curl -X POST http://localhost:5001/api/sources/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "includeDebugLogs": false
  }'

# Analyser et créer une source
curl -X POST http://localhost:5001/api/sources/analyze-and-create \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "brandId": "uuid",
    "name": "My Source"
  }'

# Analyser plusieurs URLs
curl -X POST http://localhost:5001/api/sources/analyze/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://url1.com", "https://url2.com"]
  }'
```

---

## 🔍 Détections Automatiques

### Blocages Détectés

| Blocage | Indicateurs | Résolution |
|---------|------------|-----------|
| **CLOUDFLARE** | En-têtes `cf-ray`, `server: cloudflare` | Google Search API |
| **RECAPTCHA** | `g-recaptcha`, `hcaptcha`, classe recaptcha | Google Search API |
| **WAF** | "Access Denied", "403 Forbidden" | Google Search API |
| **JAVASCRIPT-ONLY** | `__NEXT_DATA__`, `__NUXT__`, `ng-app` | Playwright ou Google Search |

### robots.txt

- ✅ Si permissif: Scraping autorisé
- ❌ Si `Disallow: /`: Google Search API ou affichage erreur
- ⓘ Si absent: Scraping autorisé (par défaut)

### Logs Disponibles

Chaque étape est loguée avec:
- Timestamp
- Niveau (INFO, WARN, ERROR, DEBUG)
- Étape (INIT, CONNECTION, FETCH, ANALYZE_CONTENT, ROBOTS, STRATEGY, COMPLETE)
- Message explicite
- Détails optionnels
- Durée optionnelle

```typescript
diagnostic.logs.forEach(log => {
  console.log(`[${log.timestamp}] ${log.level} - ${log.step}`);
  console.log(`  ${log.message}`);
});
```

---

## 🧪 Tests Unitaires

Le module inclut des tests complets couvrant:

### Stratégies (4 tests de base)
- ✅ SCRAPABLE: HTML valide, contenu accessible
- ✅ GOOGLE_SEARCH: Cloudflare, reCAPTCHA, WAF, JS-only, robots.txt restrictif
- ✅ UNSUPPORTED: URL invalide, 404, page vide, erreur réseau
- ✅ API_REQUIRED: Endpoints d'API

### Cas Limites
- ✅ Timeouts réseau
- ✅ Génération de logs détaillés
- ✅ Recommandations pertinentes
- ✅ Timestamps valides

### Performance
- ✅ Analyse < 10 secondes

### Messages Utilisateur
- ✅ Clairs et explicites pour chaque stratégie

```bash
# Lancer les tests
npm run test -- source-analyzer.test.ts

# Avec coverage
npm run test -- --coverage source-analyzer.test.ts
```

---

## 📊 Réponse Typique

```json
{
  "success": true,
  "data": {
    "diagnostic": {
      "url": "https://news.example.com",
      "strategy": "SCRAPABLE",
      "status": 200,
      "contentType": "text/html; charset=utf-8",
      "hasContent": true,
      "isJavaScriptOnly": false,
      "blockageType": "NONE",
      "hasRobotsTxt": true,
      "robotsAllowScraping": true,
      "estimatedSize": 45234,
      "message": "Cette source peut être scrappée directement. Les mentions seront collectées via Cheerio/Playwright.",
      "recommendations": [
        "La source sera scrappée toutes les 6 heures par défaut",
        "Vous pouvez ajuster la fréquence de scraping dans les paramètres"
      ],
      "logs": [
        {
          "level": "INFO",
          "step": "INIT",
          "message": "Analyse de: https://news.example.com",
          "timestamp": "2026-01-28T10:30:00.000Z"
        },
        {
          "level": "INFO",
          "step": "CONNECTION",
          "message": "Statut: 200 OK",
          "timestamp": "2026-01-28T10:30:00.100Z"
        }
        // ... plus de logs
      ],
      "timestamp": "2026-01-28T10:30:00.500Z"
    },
    "suggestedSourceType": "BLOG",
    "suggestedConfig": {
      "url": "https://news.example.com",
      "scrapingFrequency": 21600,
      "method": "cheerio"
    },
    "requiresUserAction": false,
    "actionDescription": "Vous pouvez créer une source web pour scraper automatiquement cette URL."
  }
}
```

---

## 🏗️ Architecture

### Fichiers

```
api/src/modules/sources/
├── source-analyzer.ts              # Logique principale (400+ lignes)
├── source-analyzer.service.ts       # Service intégration Prisma
├── source-analyzer.controller.ts    # Endpoints Express
├── source-analyzer.routes.ts        # Routes
├── source-analyzer.test.ts          # Tests unitaires (400+ lignes)
└── SOURCE_ANALYZER_GUIDE.md        # Documentation complète
```

### Dépendances

```typescript
import axios from 'axios';           // Requêtes HTTP
import * as cheerio from 'cheerio';  // Parsing HTML
import { Logger } from 'winston';    // Logging
import pRetry from 'p-retry';        // Retries automatiques
```

### Types TypeScript

```typescript
enum CollectionStrategy {
  SCRAPABLE = 'SCRAPABLE',
  API_REQUIRED = 'API_REQUIRED',
  GOOGLE_SEARCH = 'GOOGLE_SEARCH',
  UNSUPPORTED = 'UNSUPPORTED'
}

enum BlockageType {
  CLOUDFLARE = 'CLOUDFLARE',
  RECAPTCHA = 'RECAPTCHA',
  WAF = 'WAF',
  NONE = 'NONE'
}

interface SourceDiagnostic {
  url: string;
  strategy: CollectionStrategy;
  status: number | null;
  hasContent: boolean;
  isJavaScriptOnly: boolean;
  blockageType: BlockageType;
  // ... 10+ autres propriétés
  logs: DiagnosticLog[];
  timestamp: Date;
}
```

---

## 🔌 Intégration avec Sentinelle

### Workflow Complet

```
1. Utilisateur soumet une URL
   POST /api/sources/analyze-and-create

2. SourceAnalyzer détecte la stratégie
   → SCRAPABLE → Crée source BLOG/FORUM
   → GOOGLE_SEARCH → Crée source NEWS
   → UNSUPPORTED → Erreur

3. Source créée avec config complète
   config: { analysisMeta: {...} }

4. Worker scraping.processor reçoit la source
   → Regarde analysisMeta
   → Utilise Cheerio ou Playwright selon les conditions

5. Collector utilise la meilleure approche
   → Scraping direct OU
   → Google Search API OU
   → API spécifique

6. Mentions collectées et stockées
   → Source.lastScrapedAt = now
   → Mentions → BD
```

### Compatibilité

✅ Fonctionnera avec:
- Collectors existants (Web, Twitter, Reddit, etc.)
- Workers existants (scraping.processor, mention.processor)
- Prisma schema (Source model)
- Architecture BullMQ
- Winston logger

---

## ⚡ Performance

| Métrique | Valeur |
|----------|--------|
| **Timeout par défaut** | 10 secondes |
| **Retries automatiques** | 2 |
| **Temps analyse simple** | 200-500ms |
| **Temps analyse bloquée** | 300-700ms |
| **Batch (10 URLs)** | 2-5 secondes |
| **Content-length limit** | 5MB |

---

## 🔐 Sécurité & Légalité

### Respecté

✅ robots.txt
- Vérification systématique
- Refus de scraper si `Disallow: /`

✅ Pas de contournement
- Pas de proxy
- Pas de contournement Cloudflare
- Pas de scraping de contenu privé

✅ User-Agent approprié
- Se présente comme un navigateur
- Respecte les bonnes pratiques

### À Implémenter Côté Utilisateur

⚠️ Responsable de:
- Avoir les droits légaux de scraper
- Respecter les Terms of Service
- Gérer les API keys de manière sécurisée
- Respecter les rate limits

---

## 🐛 Debugging

### Activer les logs de debug

```bash
# Avec includeDebugLogs=true
curl -X POST http://localhost:5001/api/sources/analyze \
  -d '{"url": "...", "includeDebugLogs": true}'
```

### Exporter les logs

```typescript
const diagnostic = await analyzer.analyze(url);
const logsJson = service.exportLogsJson(diagnostic);
console.log(logsJson);
```

### Winston Logger

```typescript
const service = new SourceAnalyzerService(
  prisma,
  logger  // Winston logger instance
);

// Les logs seront envoyés à Winston
// avec le contexte [SourceAnalyzerService]
```

---

## 📈 Extensibilité

### Ajouter une Nouvelle Détection

```typescript
// 1. Ajouter au enum
enum BlockageType {
  CLOUDFLARE = 'CLOUDFLARE',
  // ... autres
  MY_CUSTOM_BLOCKER = 'MY_CUSTOM_BLOCKER'
}

// 2. Ajouter aux indicateurs
private readonly CUSTOM_INDICATORS = ['My Blocker Text'];

// 3. Mettre à jour detectBlockage()
if (html.includes('My Blocker Text')) {
  return BlockageType.MY_CUSTOM_BLOCKER;
}

// 4. Mettre à jour les messages
private generateMessage(...) {
  case MY_CUSTOM_BLOCKER:
    return 'Cette source utilise un blocage custom...';
}
```

### Ajouter une Nouvelle Stratégie

```typescript
// 1. Ajouter à l'enum
enum CollectionStrategy {
  // ... existantes
  RSS_FEED = 'RSS_FEED'
}

// 2. Ajouter la détection
if (contentType.includes('application/rss+xml')) {
  return CollectionStrategy.RSS_FEED;
}

// 3. Mettre à jour les messages et recommandations
```

---

## 📝 Changelog

### v1.0.0 (Initial)
- ✅ Analyse automatique d'URLs
- ✅ Détection de Cloudflare, reCAPTCHA, WAF
- ✅ Détection JavaScript-only
- ✅ Vérification robots.txt
- ✅ 4 stratégies principales
- ✅ Logging détaillé
- ✅ Tests complets
- ✅ API REST + Service

---

## 🤝 Contribution

Pour ajouter une nouvelle fonctionnalité:

1. Créer une branche: `git checkout -b feature/xyz`
2. Ajouter des tests: `src/modules/sources/source-analyzer.test.ts`
3. Documenter: Mettre à jour ce README
4. Soumettre une PR

---

## 📞 Support

Pour les questions ou bugs:

1. Vérifier les logs détaillés: `includeDebugLogs=true`
2. Consulter `SOURCE_ANALYZER_GUIDE.md`
3. Vérifier les tests pour des exemples d'utilisation
4. Contacter l'équipe

---

**Made with ❤️ for Sentinelle Reputation**
