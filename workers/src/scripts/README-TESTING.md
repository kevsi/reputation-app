# 🧪 Guide de Test du Système

## 📋 Objectif

Valider que le système fonctionne correctement **sans consommer les quotas API gratuits**.

Tous les scripts de test utilisent des **mocks** et des **données de test uniquement**.

---

## 🚀 Scripts Disponibles

### 1. Quick Check (30 secondes)

Vérification rapide des connexions essentielles.

```bash
npx ts-node src/scripts/quick-check.ts
```

**Ce qu'il vérifie :**
- ✅ Connexion base de données
- ✅ Connexion Redis/BullMQ
- ✅ Collectors enregistrés
- ✅ Nombre de sources actives
- ✅ Total des mentions en base

**Quand l'utiliser :**
- Avant chaque session de développement
- Pour vérifier rapidement que le système fonctionne
- Quand vous n'avez que 30 secondes

**Exemple output :**
```
⚡ QUICK SYSTEM CHECK (30 seconds)

==================================================

✅ Database: Connected
✅ Redis/BullMQ: Connected
✅ Collectors: 8 registered
📊 Active Sources: 2
📊 Total Mentions: 547

==================================================

✅ System operational - Ready for development
```

---

### 2. Full System Audit (2-3 minutes)

Audit complet avec **test end-to-end** (SANS appels API).

```bash
npx ts-node src/scripts/audit-system.ts
```

**Ce qu'il fait :**

1. ✅ Vérifie la connexion base de données
2. ✅ Vérifie la connexion Redis/BullMQ
3. ✅ Vérifie les collectors enregistrés
4. 🎭 **Crée une source de test MOCK**
5. 🎭 **Génère des mentions fictives réalistes**
6. ✅ **Teste le flux complet** : Source → Collector → Mentions → Database
7. 🧹 **Nettoie les données de test** automatiquement
8. ✅ Vérifie le statut des workers

**Quand l'utiliser :**
- Après changements majeurs du système
- Avant de créer des vraies sources
- Après corrections de bugs
- Pour valider que tout fonctionne de bout en bout

**IMPORTANT :**
- ✅ N'utilise AUCUN quota API
- ✅ Crée et nettoie ses propres données de test
- ✅ Totalement sûr à exécuter autant de fois que nécessaire

**Exemple output :**
```
🔍 SYSTÈME AUDIT - NO API CALLS MODE

══════════════════════════════════════════════════════════════════

📊 STEP 1: Database Connection

✅ [Database] Connected to database successfully
✅ [Database] Found 8 total sources (2 active)

📊 STEP 2: Redis/BullMQ Connection

✅ [Redis] Connected to Redis successfully
✅ [BullMQ] Scraping Queue operational
✅ [BullMQ] Mention Queue operational

📊 STEP 3: Collectors Registration

✅ [Collectors] 8 collectors registered
   Registered: GOOGLE_REVIEWS, REDDIT, YOUTUBE, YELP, NEWS_API, WEB, TRUSTPILOT, FACEBOOK

📊 STEP 4: End-to-End Flow Test (MOCK DATA)

   Creating test source...
✅ [Test Source] Created test source: clxxxxx...
   Creating scraping job...
✅ [Job Creation] Job created: 123
   Processing job with MockCollector...
🎭 [MOCK] Simulating collection for source: clxxxxx (MOCK)
✅ [MOCK] Generated 5 test mentions
✅ [Mock Collection] MockCollector generated 5 test mentions
   Saving mentions to database...
✅ [Mentions Created] 5 mentions saved in database

   📝 Sample Mention:
      Author: TestUser1
      Content: This is a test review with positive feedback. Great prod...
      Sentiment: POSITIVE
      Rating: 4
      Published: 1/28/2026

   Cleaning up test data...
✅ [Cleanup] Test data cleaned up

📊 STEP 5: Workers Status

✅ [Workers] 1 scraping worker(s) active
✅ [Workers] 1 mention worker(s) active

══════════════════════════════════════════════════════════════════
📊 AUDIT SUMMARY

✅ Success: 15
⚠️  Warnings: 0
❌ Errors: 0

🎉 SYSTEM IS FULLY OPERATIONAL!

✅ You can safely create real sources and start collecting data.

📝 Next steps:
   1. Create a real source via your UI or API
   2. The system will automatically collect mentions
   3. Mentions will appear on the dedicated source page

══════════════════════════════════════════════════════════════════

💡 API Quota Status:
   ✅ NO API calls were made during this audit
   ✅ All quotas preserved for production use
```

---

## 🔄 Workflow Recommandé

### ✅ Avant de créer une première source

```bash
# 1. Quick check (30 secondes)
npx ts-node src/scripts/quick-check.ts

# 2. Si OK, run full audit (2-3 minutes)
npx ts-node src/scripts/audit-system.ts

# 3. Si tout est ✅, créer une vraie source via l'UI
```

### ✅ Après avoir créé une source réelle

```bash
# Attendre 1-2 minutes que le système traite
# Puis vérifier avec un check rapide

npx ts-node src/scripts/quick-check.ts

# Vous devriez voir les nombres augmenter :
# 📊 Active Sources: 3 (au lieu de 2)
# 📊 Total Mentions: XXX
```

### ✅ Après des changements majeurs

```bash
# Toujours faire l'audit complet après des changements

npx ts-node src/scripts/audit-system.ts

# Si tout est ✅ vous êtes bon pour la production
```

---

## 🎯 Interprétation des Résultats

### ✅ Tout est OK

```
🎉 SYSTEM IS FULLY OPERATIONAL!
✅ You can safely create real sources

✅ Success: 15
⚠️  Warnings: 0
❌ Errors: 0
```

**→ Vous pouvez créer des sources réelles en confiance**

---

### ⚠️ Il y a des warnings

```
⚠️  SYSTEM IS MOSTLY OPERATIONAL
Some warnings detected but system should work

✅ Success: 14
⚠️  Warnings: 1
❌ Errors: 0
```

**→ Système fonctionne mais vérifiez les warnings**

Exemples de warnings normaux :
- "No scraping workers detected (may be normal if not running)"
- "Could not check workers"

Ces warnings sont OK si vous n'avez pas lancé les workers.

---

### ❌ Il y a des erreurs

```
❌ SYSTEM HAS CRITICAL ERRORS
Fix the errors above before creating real sources

✅ Success: 10
⚠️  Warnings: 2
❌ Errors: 3
```

**→ NE PAS créer de sources, corriger les erreurs d'abord**

Vérifiez les messages d'erreur et corriger les problèmes.

---

## 🛡️ Quotas API Préservés

### Garanties

Tous les scripts de test utilisent des **mocks uniquement** :

- ❌ Aucun appel à Google Places API
- ❌ Aucun appel à Yelp API
- ❌ Aucun appel à YouTube API
- ❌ Aucun appel à NewsAPI
- ❌ Aucun appel à Reddit API
- ❌ Aucun appel à Twitter/X API
- ❌ Aucun appel à Trustpilot API
- ❌ Aucun appel à Facebook API

### Résultat

✅ **Quotas 100% préservés** pour la production réelle

---

## 📝 Notes Importantes

### Comment fonctionne le MockCollector

Le `MockCollector` simule parfaitement le comportement des vrais collectors :

1. **Simule un délai réseau** (500ms)
2. **Génère 5 mentions fictives** qui ressemblent aux vraies données
3. **Inclut tous les champs réalistes** :
   - Author, Content, URL
   - Rating (1-5), Sentiment (POSITIVE/NEUTRAL/NEGATIVE)
   - publishedAt (derniers 7 jours)
   - metadata réaliste

4. **Ne fait AUCUN appel API** - pur mock

### Test End-to-End Complet

L'audit fonctionne comme cela :

```
1. Créer une source MOCK
   ↓
2. Enregistrer le MockCollector
   ↓
3. Générer des mentions fictives
   ↓
4. Sauvegarder en base de données
   ↓
5. Vérifier que tout fonctionne
   ↓
6. Nettoyer (supprimer source + mentions)
```

Aucune donnée de test ne reste après l'audit.

---

## 🚨 Troubleshooting

### Database: FAILED

**Problème :** Connexion à la base de données impossible

**Solutions :**
```bash
# 1. Vérifier que PostgreSQL est lancé
docker ps | grep postgres

# 2. Vérifier les variables d'environnement
echo $DATABASE_URL

# 3. Relancer Docker
docker-compose up -d postgres
```

---

### Redis/BullMQ: FAILED

**Problème :** Connexion à Redis impossible

**Solutions :**
```bash
# 1. Vérifier que Redis est lancé
docker ps | grep redis

# 2. Vérifier les variables d'environnement
echo $REDIS_URL

# 3. Relancer Docker
docker-compose up -d redis
```

---

### Collectors: NONE registered

**Problème :** Aucun collector enregistré

**Solutions :**
1. Vérifier `workers/src/collectors/index.ts`
2. S'assurer que les collectors sont importés
3. Vérifier la configuration dans `collectors.config.ts`

---

## 💡 Tips & Tricks

### Lancer des checks réguliers

Ajoutez une tâche npm dans `package.json` :

```json
{
  "scripts": {
    "check": "ts-node src/scripts/quick-check.ts",
    "audit": "ts-node src/scripts/audit-system.ts"
  }
}
```

Alors vous pouvez faire :
```bash
npm run check
npm run audit
```

### Lancer l'audit avec verbose

Pour plus de détails :
```bash
DEBUG=* npx ts-node src/scripts/audit-system.ts
```

### Nettoyer manuellement les données de test

Si l'audit s'arrête brutalement et laisse des données de test :

```sql
-- Supprimer les sources MOCK et leurs mentions
DELETE FROM "mention" WHERE "sourceId" IN (
  SELECT id FROM "source" WHERE type = 'MOCK'
);

DELETE FROM "source" WHERE type = 'MOCK';
```

---

## ✅ Checklist Avant Production

Avant de créer des sources réelles :

- [ ] `npx ts-node src/scripts/quick-check.ts` ✅
- [ ] `npx ts-node src/scripts/audit-system.ts` ✅ (pas d'erreurs)
- [ ] Les workers sont lancés (si nécessaire)
- [ ] Les API keys sont configurées correctement
- [ ] La base de données contient les tables nécessaires

---

## 📚 Pour Aller Plus Loin

### Documents connexes

- [COLLECTORS_GUIDE.md](../COLLECTORS_GUIDE.md) - Guide complet des collectors
- [README.md](../../README.md) - Documentation générale du projet
- [docker-compose.yaml](../../docker-compose.yaml) - Configuration Docker

### Autres scripts utiles

```bash
# Vérifier l'état des collectors
npx ts-node src/scripts/check-collectors.ts

# Vérifier les données collectées
npx ts-node src/scripts/check-collected-data.ts

# Valider les sources
npx ts-node src/scripts/validate-sources.ts

# Manage les sources
npx ts-node src/scripts/manage-sources.ts
```

---

## 🎯 FAQ

### Q: Puis-je exécuter audit-system.ts plusieurs fois ?

**R:** Oui, complètement sans danger. Le script nettoie toujours après lui.

### Q: L'audit consomme-t-il mes quotas API ?

**R:** Non ! Zéro appel API. 100% mock.

### Q: Combien de temps prend l'audit ?

**R:** 2-3 minutes maximum.

### Q: Qu'est-ce que le MockCollector ?

**R:** Un collector de test qui simule les vraies données sans appels API.

### Q: Je peux utiliser MockCollector en production ?

**R:** Non, c'est juste pour les tests. Utilisez les vrais collectors en production.

### Q: Où se trouvent les scripts de test ?

**R:** `workers/src/scripts/`

---

## 🎉 Prochaines Étapes

Une fois que vous voyez :

```
🎉 SYSTEM IS FULLY OPERATIONAL!
✅ You can safely create real sources
```

Vous pouvez :

1. **Créer une vraie source** via votre UI ou API
2. **Le système collectera automatiquement** les mentions
3. **Les mentions apparaîtront** sur la page dédiée de la source
4. **Vérifiez les résultats** avec `check-collected-data.ts`

Bonne chance ! 🚀
