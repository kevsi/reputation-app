#!/usr/bin/env node

/**
 * 🎭 Mock Collector Demo
 * 
 * Démonstration d'utilisation du MockCollector
 * Montre comment générer et utiliser des données de test
 * 
 * Usage:
 *   npx ts-node src/scripts/mock-demo.ts
 */

import { MockCollector } from '../collectors/__mocks__';
import { prisma } from '../config/database';
import chalk from 'chalk';

async function mockDemo() {
  console.log(chalk.bold.cyan('\n🎭 MOCK COLLECTOR DEMONSTRATION\n'));
  console.log('═'.repeat(70) + '\n');
  
  try {
    // 1. Créer une source de test
    console.log(chalk.bold('📊 Step 1: Creating test brand\n'));
    
    const org = await prisma.organization.findFirst();
    if (!org) {
      throw new Error('No organization found. Create one first.');
    }
    
    const testBrand = await prisma.brand.create({
      data: {
        name: `🎭 Mock Demo Brand - ${new Date().toISOString()}`,
        organizationId: org.id,
        keywords: ['test', 'demo'],
        isActive: true,
      },
    });
    
    console.log(`✅ Created test brand: ${testBrand.id}\n`);
    
    // 1b. Créer une source de test
    console.log(chalk.bold('📊 Step 1b: Creating test source\n'));
    
    const testSource = await prisma.source.create({
      data: {
        type: 'OTHER',
        name: `🎭 Mock Demo - ${new Date().toISOString()}`,
        isActive: true,
        brandId: testBrand.id,
        config: {
          demo: true,
        },
      },
    });
    
    console.log(`✅ Created test source: ${testSource.id}`);
    console.log(`   Name: ${testSource.name}\n`);
    
    // 2. Créer une instance du MockCollector
    console.log(chalk.bold('📊 Step 2: Creating MockCollector instance\n'));
    
    const mockCollector = new MockCollector('DEMO');
    console.log('✅ MockCollector created\n');
    
    // 3. Générer des mentions fictives
    console.log(chalk.bold('📊 Step 3: Generating mock mentions\n'));
    
    const mentions = await mockCollector.collect(testSource, ['test', 'demo']);
    
    console.log(`✅ Generated ${mentions.length} mock mentions\n`);
    
    // 4. Afficher les mentions générées
    console.log(chalk.bold('📊 Step 4: Generated Mentions\n'));
    
    mentions.forEach((mention, index) => {
      console.log(chalk.yellow(`\nMention #${index + 1}:`));
      console.log(`  ID: ${mention.externalId}`);
      console.log(`  Author: ${mention.author}`);
      console.log(`  Content: ${mention.text}`);
      console.log(`  URL: ${mention.url}`);
      console.log(`  Rating: ${mention.rawData?.rating}`);
      console.log(`  Sentiment: ${mention.rawData?.sentiment}`);
      console.log(`  Published: ${mention.publishedAt.toLocaleDateString()}`);
    });
    
    // 5. Sauvegarder en base de données
    console.log(chalk.bold('\n📊 Step 5: Saving to database\n'));
    
    const savedMentions = await Promise.all(
      mentions.map(mention =>
        prisma.mention.create({
          data: {
            brandId: testBrand.id,
            sourceId: testSource.id,
            externalId: mention.externalId,
            author: mention.author,
            content: mention.text,
            url: mention.url,
            publishedAt: mention.publishedAt,
            platform: 'OTHER',
            sentiment: (mention.rawData?.sentiment as any) || 'NEUTRAL',
            engagementCount: (mention.engagementCount as number) || 0,
            rawData: mention.rawData || {},
          },
        })
      )
    );
    
    console.log(`✅ Saved ${savedMentions.length} mentions to database\n`);
    
    // 6. Récupérer et afficher les mentions sauvegardées
    console.log(chalk.bold('📊 Step 6: Retrieving from database\n'));
    
    const dbMentions = await prisma.mention.findMany({
      where: { sourceId: testSource.id },
    });
    
    console.log(`✅ Retrieved ${dbMentions.length} mentions from database\n`);
    
    dbMentions.forEach((mention, index) => {
      console.log(chalk.green(`\nDatabase Mention #${index + 1}:`));
      console.log(`  ID: ${mention.id}`);
      console.log(`  ExternalID: ${mention.externalId}`);
      console.log(`  Author: ${mention.author}`);
      console.log(`  Content: ${mention.content?.substring(0, 50)}...`);
      console.log(`  Platform: ${mention.platform}`);
      console.log(`  Sentiment: ${mention.sentiment}`);
      console.log(`  Engagement: ${mention.engagementCount}`);
    });
    
    // 7. Cleanup
    console.log(chalk.bold('\n📊 Step 7: Cleanup\n'));
    
    await prisma.mention.deleteMany({
      where: { sourceId: testSource.id },
    });
    
    await prisma.source.delete({
      where: { id: testSource.id },
    });
    
    await prisma.brand.delete({
      where: { id: testBrand.id },
    });
    
    console.log('✅ Test data cleaned up\n');
    
    // 8. Résumé
    console.log('═'.repeat(70));
    console.log(chalk.green.bold('\n🎉 DEMO COMPLETE!\n'));
    
    console.log(chalk.cyan('What the MockCollector does:'));
    console.log('  1. Generates realistic test data');
    console.log('  2. Simulates API behavior without making calls');
    console.log('  3. Includes all realistic fields');
    console.log('  4. Can be used for testing without quota usage\n');
    
    console.log(chalk.cyan('Key points:'));
    console.log('  ✅ NO API calls made');
    console.log('  ✅ NO quotas consumed');
    console.log('  ✅ Fully realistic data');
    console.log('  ✅ Perfect for testing\n');
    
  } catch (error: any) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

mockDemo();
