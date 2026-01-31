/**
 * 🧪 Test Script for Collectors
 *
 * Test all available collectors to ensure they work correctly
 */

import { CollectorFactory } from './dist/collectors/index.js';

async function testCollector(type, config = {}) {
  console.log(`\n🧪 Testing ${type} collector...`);

  try {
    const collector = CollectorFactory.getCollector(type);

    // Test connection
    const connectionTest = await collector.testConnection(config);
    console.log(`  📡 Connection: ${connectionTest.success ? '✅' : '❌'} ${connectionTest.message}`);

    if (connectionTest.success) {
      // Test collection with sample keywords
      const mockSource = {
        id: 'test-source',
        name: 'Test Brand',
        type: type,
        config: config,
        isActive: true
      };

      const mentions = await collector.collect(mockSource, ['test', 'review']);
      console.log(`  📊 Collected ${mentions.length} mentions`);

      if (mentions.length > 0) {
        console.log(`  💬 Sample mention: "${mentions[0].text.substring(0, 100)}..."`);
      }
    }

  } catch (error) {
    console.error(`  ❌ Error testing ${type}:`, error.message);
  }
}

async function testAllCollectors() {
  console.log('🚀 Starting collector tests...\n');

  const availableCollectors = CollectorFactory.getAvailableCollectors();
  console.log(`📋 Available collectors: ${availableCollectors.join(', ')}\n`);

  // Test configurations for each collector
  const testConfigs = {
    TRUSTPILOT: { companyName: 'test-company' },
    TWITTER: { username: 'testuser' },
    REDDIT: { searchQuery: 'test' },
    YOUTUBE: { searchQuery: 'test review' },
    FACEBOOK: { searchQuery: 'test' },
    GOOGLE_REVIEWS: { apiKey: 'test-key', placeName: 'test place' }
  };

  for (const type of availableCollectors) {
    const config = testConfigs[type] || {};
    await testCollector(type, config);
  }

  console.log('\n✅ All collector tests completed!');
}

// Run tests
testAllCollectors().catch(console.error);