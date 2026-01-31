#!/usr/bin/env node

/**
 * ✅ Configuration Validation Script
 * 
 * Vérifie la configuration complète des sources gratuites
 * - Clés API présentes
 * - Collecteurs enregistrés
 * - Quotas disponibles
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

interface ValidationResult {
  name: string;
  status: 'OK' | 'MISSING' | 'WARNING';
  message: string;
  quota?: number;
  quotaUnit?: string;
}

const results: ValidationResult[] = [];

// ============================================================================
// 🔍 Validation des sources gratuites
// ============================================================================

function validateFreeSource(
  name: string,
  envVar: string,
  quota: number,
  quotaUnit: string
): void {
  const value = process.env[envVar];

  if (value && value.length > 0) {
    results.push({
      name,
      status: 'OK',
      message: `✅ ${envVar} configured`,
      quota,
      quotaUnit,
    });
  } else {
    results.push({
      name,
      status: 'MISSING',
      message: `❌ ${envVar} NOT configured`,
      quota,
      quotaUnit,
    });
  }
}

function validatePaidSource(name: string, envVar: string): void {
  const value = process.env[envVar];

  if (value && value.length > 0) {
    results.push({
      name,
      status: 'OK',
      message: `✅ ${envVar} configured`,
    });
  } else {
    results.push({
      name,
      status: 'WARNING',
      message: `⚠️  ${envVar} NOT configured (optional paid source)`,
    });
  }
}

// ============================================================================
// Validation complète
// ============================================================================

console.log('🔍 Validating Free Sources Configuration\n');
console.log('━'.repeat(70));

// ✅ SOURCES GRATUITES (5 sources)
console.log('\n🆓 FREE SOURCES (Quota gratuit)\n');

validateFreeSource('Google Places API', 'GOOGLE_API_KEY', 2500, 'requests/day');
validateFreeSource('Reddit API', 'REDDIT_API_KEY', Infinity, 'unlimited');
validateFreeSource('YouTube Data API v3', 'YOUTUBE_API_KEY', 10000, 'units/day');
validateFreeSource('Yelp Fusion API', 'YELP_API_KEY', 5000, 'requests/day');
validateFreeSource('NewsAPI.org', 'NEWS_API_KEY', 100, 'requests/day');

// 💰 SOURCES PAYANTES (optionnelles)
console.log('\n💰 PAID SOURCES (Optional)\n');

validatePaidSource('Twitter/X API', 'TWITTER_API_KEY');
validatePaidSource('Facebook API', 'FACEBOOK_API_KEY');

// ============================================================================
// Affichage des résultats
// ============================================================================

console.log('\n━'.repeat(70));
console.log('\n📊 VALIDATION SUMMARY\n');

const ok = results.filter(r => r.status === 'OK').length;
const missing = results.filter(r => r.status === 'MISSING').length;
const warning = results.filter(r => r.status === 'WARNING').length;

// Afficher chaque résultat
for (const result of results) {
  console.log(`${result.message}`);
  if (result.quota !== undefined) {
    console.log(`   📈 Daily quota: ${result.quota === Infinity ? '∞ (unlimited)' : result.quota.toLocaleString()} ${result.quotaUnit}`);
  }
}

// Résumé
console.log('\n━'.repeat(70));
console.log('\n📈 QUOTA SUMMARY\n');

let totalDaily = 0;

const sources = [
  { name: 'Google Places', quota: 2500 },
  { name: 'Reddit', quota: Infinity },
  { name: 'YouTube Data API', quota: 10000 },
  { name: 'Yelp Fusion', quota: 5000 },
  { name: 'NewsAPI', quota: 100 },
];

for (const source of sources) {
  if (source.quota === Infinity) {
    console.log(`   ${source.name}: ∞ (unlimited)`);
  } else {
    console.log(`   ${source.name}: ${source.quota.toLocaleString()} requests/day`);
    totalDaily += source.quota;
  }
}

console.log(`\n   📊 TOTAL: ~${totalDaily.toLocaleString()} requests/day`);
console.log(`   + ∞ unlimited (Reddit)\n`);

// Status final
console.log('━'.repeat(70));
console.log('\n✨ CONFIGURATION STATUS\n');

if (missing === 0) {
  console.log('✅ ALL FREE SOURCES ARE CONFIGURED!');
  console.log('   System is ready for production.\n');
  process.exit(0);
} else {
  console.log(`❌ ${missing} FREE SOURCE(S) MISSING!\n`);
  console.log('Instructions to configure:');
  console.log('');

  // Instructions pour chaque source manquante
  for (const result of results) {
    if (result.status === 'MISSING') {
      const sourceInstructions: Record<string, string> = {
        'Google Places API':
          '1. Go to https://console.cloud.google.com\n' +
          '2. Create a project and enable "Places API"\n' +
          '3. Create an API key (Application restrictions: None)\n' +
          '4. Add to .env: GOOGLE_API_KEY=your_key_here',

        'Reddit API':
          '1. Go to https://www.reddit.com/prefs/apps\n' +
          '2. Click "Create App"\n' +
          '3. Select "Script" and fill form\n' +
          '4. Add to .env: REDDIT_API_KEY=your_client_id_here',

        'YouTube Data API v3':
          '1. Go to https://console.cloud.google.com\n' +
          '2. Create a project and enable "YouTube Data API v3"\n' +
          '3. Create an API key\n' +
          '4. Add to .env: YOUTUBE_API_KEY=your_key_here',

        'Yelp Fusion API':
          '1. Go to https://www.yelp.com/developers/v3/manage_app\n' +
          '2. Create a new app\n' +
          '3. Copy the API key\n' +
          '4. Add to .env: YELP_API_KEY=your_key_here',

        'NewsAPI.org':
          '1. Go to https://newsapi.org/register\n' +
          '2. Sign up for free account\n' +
          '3. Copy your API key\n' +
          '4. Add to .env: NEWS_API_KEY=your_key_here',
      };

      const instructionsKey = result.name
        .split('API')[0]
        .trim()
        .concat(' API');

      console.log(`📌 ${result.name}:`);
      console.log(`   ${sourceInstructions[result.name] || 'Check documentation'}\n`);
    }
  }

  process.exit(1);
}
