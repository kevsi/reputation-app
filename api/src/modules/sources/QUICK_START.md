/**
 * 🚀 QUICK START - Utilisation Simple du SourceAnalyzer
 */

// ============================================================================
// EXEMPLE 1: Cas D'Usage le Plus Simple (3 lignes)
// ============================================================================

import SourceAnalyzer from '@/modules/sources/source-analyzer';

async function analyzeURL() {
  const analyzer = new SourceAnalyzer();
  const result = await analyzer.analyze('https://example.com');
  console.log('Stratégie:', result.strategy); // SCRAPABLE | GOOGLE_SEARCH | UNSUPPORTED | API_REQUIRED
}

analyzeURL();

// ============================================================================
// EXEMPLE 2: Avec Gestion d'Erreurs
// ============================================================================

async function analyzeWithErrorHandling() {
  try {
    const analyzer = new SourceAnalyzer();
    const diagnostic = await analyzer.analyze('https://example.com');

    // Afficher le résultat
    console.log('✅ Analyse complétée');
    console.log(`Stratégie: ${diagnostic.strategy}`);
    console.log(`Message: ${diagnostic.message}`);
    console.log(`Recommandations: ${diagnostic.recommendations.join(', ')}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

analyzeWithErrorHandling();

// ============================================================================
// EXEMPLE 3: Affichage Structuré du Résultat
// ============================================================================

async function displayResult() {
  const analyzer = new SourceAnalyzer({ timeout: 10000 });
  const result = await analyzer.analyze('https://blog.example.com');

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RÉSULTAT DE L\'ANALYSE');
  console.log('═══════════════════════════════════════════════════════');

  console.log(`\n🌐 URL: ${result.url}`);
  console.log(`📍 Status HTTP: ${result.status || 'N/A'}`);
  console.log(`📏 Taille estimée: ${(result.estimatedSize / 1024).toFixed(2)} KB`);

  console.log(`\n🎯 STRATÉGIE: ${result.strategy}`);
  console.log(`💬 Message: ${result.message}`);

  console.log(`\n🔒 Sécurité:`);
  console.log(`  - Blocage détecté: ${result.blockageType}`);
  console.log(`  - JavaScript-only: ${result.isJavaScriptOnly ? '⚠️ OUI' : '✅ NON'}`);
  console.log(`  - robots.txt trouvé: ${result.hasRobotsTxt ? '✅ OUI' : '❌ NON'}`);
  console.log(`  - Scraping autorisé: ${result.robotsAllowScraping ? '✅ OUI' : '❌ NON'}`);

  console.log(`\n💡 Recommandations:`);
  result.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });

  console.log(`\n📝 Logs (${result.logs.length} entrées):`);
  result.logs.forEach(log => {
    console.log(`  [${log.level}] ${log.step}: ${log.message}`);
  });

  console.log('\n═══════════════════════════════════════════════════════\n');
}

displayResult();

// ============================================================================
// EXEMPLE 4: Décision Basée sur la Stratégie
// ============================================================================

async function decideAction() {
  const analyzer = new SourceAnalyzer();
  const diagnostic = await analyzer.analyze('https://example.com');

  console.log(`\n🔄 ACTION À PRENDRE:`);

  switch (diagnostic.strategy) {
    case 'SCRAPABLE':
      console.log('✅ Créer une source web');
      console.log('   → Type: BLOG/FORUM/NEWS');
      console.log('   → Fréquence: 6 heures');
      console.log('   → Collector: Cheerio/Playwright');
      break;

    case 'GOOGLE_SEARCH':
      console.log('🔍 Utiliser Google Search API');
      console.log('   → Raison:', diagnostic.blockageType || 'Contenu inaccessible');
      console.log('   → Type: NEWS');
      console.log('   → Fréquence: 24 heures (limites API)');
      break;

    case 'API_REQUIRED':
      console.log('🔑 Demander une clé API');
      console.log('   → Type: API');
      console.log('   → Action: Utilisateur doit fournir credentials');
      break;

    case 'UNSUPPORTED':
      console.log('❌ Non supporté');
      console.log('   → Action: Afficher erreur à l\'utilisateur');
      console.log('   → Suggestion: Essayer une autre URL');
      break;
  }
}

decideAction();

// ============================================================================
// EXEMPLE 5: Analyser Plusieurs URLs
// ============================================================================

async function analyzeMultipleURLs() {
  const urls = [
    'https://blog.example.com',
    'https://protected-site.com',
    'https://invalid-url',
    'https://forum.example.com'
  ];

  const analyzer = new SourceAnalyzer();

  console.log(`\n📊 Analyse de ${urls.length} URLs...\n`);

  for (const url of urls) {
    try {
      const result = await analyzer.analyze(url);
      const emoji = result.strategy === 'SCRAPABLE' ? '✅' : 
                    result.strategy === 'GOOGLE_SEARCH' ? '🔍' :
                    result.strategy === 'API_REQUIRED' ? '🔑' : '❌';
      
      console.log(`${emoji} ${url}`);
      console.log(`   → ${result.strategy}: ${result.message}`);
    } catch (error) {
      console.log(`❌ ${url}`);
      console.log(`   → Erreur: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

analyzeMultipleURLs();

// ============================================================================
// EXEMPLE 6: Via API HTTP
// ============================================================================

/**
 * Plutôt que TypeScript, utiliser HTTP directement:
 */

async function analyzeViaHTTP() {
  const response = await fetch('http://localhost:5001/api/sources/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://example.com',
      includeDebugLogs: false
    })
  });

  const data = await response.json();

  console.log('Réponse:', data.data.diagnostic.strategy);
  console.log('Message:', data.data.diagnostic.message);
}

// analyzeViaHTTP();

// ============================================================================
// EXEMPLE 7: Test d'Une URL Problématique
// ============================================================================

async function debugProblematicURL() {
  const analyzer = new SourceAnalyzer({
    timeout: 10000,
    maxRetries: 2
  });

  const result = await analyzer.analyze('https://cloudflare-protected.example.com');

  console.log('\n🐛 DEBUGGING');
  console.log('═══════════════════════════════════════════════════════');

  console.log(`\nStratégie: ${result.strategy}`);
  console.log(`Blocage: ${result.blockageType}`);

  console.log('\nLogs détaillés:');
  result.logs.forEach((log, i) => {
    console.log(`\n  ${i + 1}. [${log.timestamp.toLocaleTimeString()}] ${log.level} - ${log.step}`);
    console.log(`     ${log.message}`);
    if (log.details) {
      console.log(`     Détails:`, log.details);
    }
    if (log.duration) {
      console.log(`     Durée: ${log.duration}ms`);
    }
  });

  console.log('\n═══════════════════════════════════════════════════════\n');
}

debugProblematicURL();

// ============================================================================
// EXEMPLE 8: Configuration Personnalisée
// ============================================================================

async function customConfiguration() {
  // Timeout plus court pour mobile
  const analyzer = new SourceAnalyzer({
    timeout: 5000,        // 5 secondes au lieu de 10
    maxRetries: 1,        // 1 retry au lieu de 2
    userAgent: 'Mobile Bot'
  });

  const result = await analyzer.analyze('https://example.com');
  console.log('Résultat avec config personnalisée:', result.strategy);
}

customConfiguration();

// ============================================================================
// EXEMPLE 9: Export des Logs pour Support
// ============================================================================

async function exportLogsForSupport() {
  const analyzer = new SourceAnalyzer();
  const result = await analyzer.analyze('https://problematic-site.com');

  // Exporter les logs en JSON
  const logsJSON = JSON.stringify(result.logs, null, 2);
  
  // Sauvegarder dans un fichier ou envoyer au support
  console.log('Logs pour support:');
  console.log(logsJSON);

  // Ou envoyer directement
  // await sendToSupport(logsJSON);
}

exportLogsForSupport();

// ============================================================================
// EXEMPLE 10: Intégration dans une API Express
// ============================================================================

/**
 * Dans votre endpoint Express:
 */

import express from 'express';
import { Request, Response } from 'express';

const app = express();

app.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL requise' });
    }

    const analyzer = new SourceAnalyzer();
    const result = await analyzer.analyze(url);

    // Retourner le résultat
    res.json({
      success: true,
      strategy: result.strategy,
      message: result.message,
      recommendations: result.recommendations,
      url: result.url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse'
    });
  }
});

// app.listen(3000);

// ============================================================================
// QUICK REFERENCE - CAS D'USAGE RAPIDES
// ============================================================================

/**
 * 📋 Cheat Sheet - Cas d'Usage Courants
 */

// 1️⃣ Analyser une URL simple
// const analyzer = new SourceAnalyzer();
// const result = await analyzer.analyze(url);

// 2️⃣ Vérifier si scrappable
// if (result.strategy === 'SCRAPABLE') { /* créer source */ }

// 3️⃣ Vérifier les blocages
// if (result.blockageType !== 'NONE') { /* utiliser Google Search */ }

// 4️⃣ Vérifier si JS-only
// if (result.isJavaScriptOnly) { /* utiliser Playwright */ }

// 5️⃣ Vérifier robots.txt
// if (!result.robotsAllowScraping) { /* utiliser Google Search */ }

// 6️⃣ Obtenir les recommandations
// result.recommendations.forEach(rec => console.log(rec));

// 7️⃣ Accéder aux logs pour debug
// result.logs.forEach(log => console.log(log.message));

// 8️⃣ Afficher le message à l'utilisateur
// console.log(result.message); // Message explicite

// 9️⃣ Créer une source basée sur la stratégie
// const sourceType = mapStrategyToSourceType(result.strategy);

// 🔟 Exporter le diagnostic complet
// JSON.stringify(result, null, 2);

export {};
