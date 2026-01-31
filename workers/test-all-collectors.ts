#!/usr/bin/env node

/**
 * 🧪 Test All Collectors Script
 * 
 * Teste chaque collector avec des données d'exemple
 * Vérifie que chaque source fonctionne correctement
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Import des collecteurs
import { CollectorFactory } from './src/collectors';
import { isCollectorEnabled } from './src/config/collectors.config';

interface TestResult {
  collector: string;
  enabled: boolean;
  tested: boolean;
  success: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function testCollector(
  name: string,
  collector: any,
  testConfig: any
): Promise<TestResult> {
  console.log(`\n🧪 Testing ${name}...`);
  const startTime = Date.now();

  try {
    if (!collector) {
      return {
        collector: name,
        enabled: false,
        tested: false,
        success: false,
        message: '❌ Collector not found',
        duration: 0,
      };
    }

    // Test de connexion
    const instance = new collector();
    const isValid = await instance.validateCredentials?.();

    if (!isValid) {
      return {
        collector: name,
        enabled: true,
        tested: true,
        success: false,
        message: '❌ Invalid credentials',
        duration: Date.now() - startTime,
      };
    }

    // Test de collecte avec données d'exemple
    const testSource = {
      id: `test-${name.toLowerCase()}`,
      name: `Test ${name}`,
      config: testConfig,
    };

    const mentions = await instance.collect(testSource);

    if (Array.isArray(mentions)) {
      return {
        collector: name,
        enabled: true,
        tested: true,
        success: true,
        message: `✅ ${mentions.length} items collected`,
        duration: Date.now() - startTime,
      };
    } else {
      return {
        collector: name,
        enabled: true,
        tested: true,
        success: false,
        message: '❌ Invalid response format',
        duration: Date.now() - startTime,
      };
    }
  } catch (error: any) {
    return {
      collector: name,
      enabled: true,
      tested: true,
      success: false,
      message: `❌ ${error.message}`,
      duration: Date.now() - startTime,
    };
  }
}

async function runTests(): Promise<void> {
  console.log('━'.repeat(70));
  console.log('🧪 COLLECTOR TEST SUITE\n');

  // Configuration des tests pour chaque collecteur
  const testConfigs: Record<string, any> = {
    GOOGLE_REVIEWS: {
      placeName: 'Coffee Shop',
      location: 'New York',
    },
    REDDIT: {
      keywords: ['coffee', 'review'],
      subreddit: 'r/coffee',
      includeComments: false,
    },
    YOUTUBE: {
      keywords: ['coffee review'],
      maxResults: 5,
      includeComments: false,
    },
    YELP: {
      businessName: 'Starbucks',
      location: 'New York',
    },
    NEWS_API: {
      keywords: ['coffee', 'business'],
      language: 'en',
    },
    TWITTER: {
      keywords: ['coffee'],
    },
    FACEBOOK: {
      pageId: 'test',
    },
  };

  // Collecteurs disponibles
  const collectorsToTest = [
    { name: 'GOOGLE_REVIEWS', required: true },
    { name: 'REDDIT', required: true },
    { name: 'YOUTUBE', required: true },
    { name: 'YELP', required: true },
    { name: 'NEWS_API', required: true },
    { name: 'TWITTER', required: false },
    { name: 'FACEBOOK', required: false },
  ];

  // Tester chaque collecteur
  for (const { name, required } of collectorsToTest) {
    const enabled = isCollectorEnabled(name);

    if (!enabled && required) {
      results.push({
        collector: name,
        enabled: false,
        tested: false,
        success: false,
        message: '⏭️  Not enabled in configuration',
        duration: 0,
      });
      continue;
    }

    if (!enabled) {
      results.push({
        collector: name,
        enabled: false,
        tested: false,
        success: false,
        message: '⏭️  Not enabled (optional)',
        duration: 0,
      });
      continue;
    }

    try {
      const collectorClass = CollectorFactory.getCollector(name);
      const config = testConfigs[name] || {};
      const result = await testCollector(name, collectorClass, config);
      results.push(result);
    } catch (error: any) {
      results.push({
        collector: name,
        enabled: true,
        tested: false,
        success: false,
        message: `❌ ${error.message}`,
        duration: 0,
      });
    }
  }

  // Afficher les résultats
  console.log('\n━'.repeat(70));
  console.log('\n📊 TEST RESULTS\n');

  for (const result of results) {
    const statusIcon = result.success ? '✅' : result.enabled ? '❌' : '⏭️ ';
    console.log(`${statusIcon} ${result.collector.padEnd(15)} ${result.message.padEnd(30)} (${result.duration}ms)`);
  }

  // Résumé
  console.log('\n━'.repeat(70));
  console.log('\n✨ SUMMARY\n');

  const tested = results.filter(r => r.tested).length;
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => r.tested && !r.success).length;
  const disabled = results.filter(r => !r.enabled).length;

  console.log(`   ✅ Passed: ${passed}/${tested}`);
  console.log(`   ❌ Failed: ${failed}/${tested}`);
  console.log(`   ⏭️  Disabled: ${disabled}\n`);

  if (failed === 0 && tested > 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
    process.exit(0);
  } else if (failed > 0) {
    console.log(`⚠️  ${failed} TEST(S) FAILED\n`);
    process.exit(1);
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
