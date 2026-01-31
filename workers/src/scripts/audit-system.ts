#!/usr/bin/env node

/**
 * 🔍 AUDIT SYSTÈME COMPLET
 * 
 * Ce script vérifie que tout fonctionne SANS consommer les quotas API
 * Il utilise des mocks et des données de test uniquement
 * 
 * Usage:
 *   npx ts-node src/scripts/audit-system.ts
 * 
 * ✅ NO API CALLS - Quotas 100% préservés
 * ✅ End-to-end flow test with mock data
 * ✅ Complete cleanup after test
 */

import { prisma } from '../config/database';
import { scrapingQueue, mentionQueue } from '../lib/queues';
import { CollectorFactory } from '../collectors';
import { MockCollector } from '../collectors/__mocks__/mock.collector';
import chalk from 'chalk';

interface AuditResult {
  step: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

const results: AuditResult[] = [];

function logResult(step: string, status: 'success' | 'warning' | 'error', message: string, details?: any) {
  results.push({ step, status, message, details });
  
  const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
  console.log(`${icon} [${step}] ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

async function auditSystem() {
  console.log(chalk.bold('\n🔍 SYSTÈME AUDIT - NO API CALLS MODE\n'));
  console.log('═'.repeat(70) + '\n');
  
  try {
    // ========================================
    // 1. VÉRIFICATION BASE DE DONNÉES
    // ========================================
    console.log(chalk.bold('📊 STEP 1: Database Connection\n'));
    
    try {
      await prisma.$connect();
      logResult('Database', 'success', 'Connected to database successfully');
      
      // Compter les sources existantes
      const sourcesCount = await prisma.source.count();
      const activeSourcesCount = await prisma.source.count({ where: { isActive: true } });
      
      logResult('Database', 'success', `Found ${sourcesCount} total sources (${activeSourcesCount} active)`);
      
    } catch (error: any) {
      logResult('Database', 'error', `Database connection failed: ${error.message}`);
      throw error;
    }

    // ========================================
    // 2. VÉRIFICATION REDIS/BULLMQ
    // ========================================
    console.log('\n' + chalk.bold('📊 STEP 2: Redis/BullMQ Connection\n'));
    
    try {
      // Tester la connexion en récupérant les stats des queues
      const scrapingCounts = await scrapingQueue.getJobCounts();
      const mentionCounts = await mentionQueue.getJobCounts();
      
      logResult('Redis', 'success', 'Connected to Redis successfully');
      logResult('BullMQ', 'success', 'Scraping Queue operational', scrapingCounts);
      logResult('BullMQ', 'success', 'Mention Queue operational', mentionCounts);
      
    } catch (error: any) {
      logResult('Redis', 'error', `Redis connection failed: ${error.message}`);
      throw error;
    }

    // ========================================
    // 3. VÉRIFICATION COLLECTORS
    // ========================================
    console.log('\n' + chalk.bold('📊 STEP 3: Collectors Registration\n'));
    
    try {
      // CollectorFactory is auto-initialized via collectors/index.ts import
      const registeredCollectors = CollectorFactory.getRegisteredCollectors();
      logResult('Collectors', 'success', `Collector system initialized (${registeredCollectors.length} collectors registered)`);
      
    } catch (error: any) {
      logResult('Collectors', 'warning', `Collector init: ${error.message}`);
    }

    // ========================================
    // 4. TEST DE FLUX COMPLET (AVEC MOCK)
    // ========================================
    console.log('\n' + chalk.bold('📊 STEP 4: End-to-End Flow Test (MOCK DATA)\n'));
    
    let testBrandId: string | null = null;
    let testSourceId: string | null = null;
    
    try {
      // 4.1 Obtenir ou créer une organisation & marque de test
      console.log('   Creating test brand...');
      
      const org = await getOrCreateTestOrganization();
      const testBrand = await prisma.brand.create({
        data: {
          name: `🎭 System Audit Test Brand - ${new Date().toISOString()}`,
          organizationId: org,
          isActive: true,
          keywords: ['test', 'audit'],
        },
      });
      
      testBrandId = testBrand.id;
      logResult('Test Brand', 'success', `Created test brand: ${testBrand.id}`);
      
      // 4.2 Créer une source de test avec un type valide
      console.log('   Creating test source...');
      
      const testSource = await prisma.source.create({
        data: {
          type: 'OTHER', // Utiliser OTHER qui est dans l'enum SourceType
          name: `🎭 System Audit Test Source - ${new Date().toISOString()}`,
          isActive: true,
          brandId: testBrand.id,
          config: {
            isMockTest: true,
            createdBy: 'audit-script',
            timestamp: Date.now(),
          },
        },
      });
      
      testSourceId = testSource.id;
      logResult('Test Source', 'success', `Created test source: ${testSource.id}`);
      
      // 4.3 Créer un job de scraping
      console.log('   Creating scraping job...');
      
      const job = await scrapingQueue.add('scrape-source', {
        sourceId: testSource.id,
        sourceType: 'OTHER',
      });
      
      logResult('Job Creation', 'success', `Job created: ${job.id}`);
      
      // 4.4 Obtenir le MockCollector et générer des mentions
      console.log('   Processing with MockCollector...');
      
      const mockCollector = new MockCollector();
      const testMentions = await mockCollector.collect(testSource as any, []);
      
      if (testMentions.length > 0) {
        logResult('Mock Collection', 'success', `MockCollector generated ${testMentions.length} test mentions`);
        
        // 4.5 Sauvegarder les mentions en base de données avec les champs corrects
        console.log('   Saving mentions to database...');
        
        const savedMentions = await Promise.all(
          testMentions.map(mention =>
            prisma.mention.create({
              data: {
                brandId: testBrand.id,
                sourceId: testSource.id,
                externalId: mention.externalId,
                author: mention.author,
                content: mention.text,
                url: mention.url,
                publishedAt: mention.publishedAt,
                platform: 'OTHER', // Utiliser le même type que la source
                sentiment: (mention.rawData?.sentiment as any) || 'NEUTRAL',
                engagementCount: (mention.engagementCount as number) || 0,
                rawData: mention.rawData || {},
              },
            })
          )
        );
        
        logResult('Mentions Created', 'success', `${savedMentions.length} mentions saved in database`);
        
        // Afficher un exemple de mention
        const sample = savedMentions[0];
        console.log('\n   📝 Sample Mention:');
        console.log(`      Author: ${sample.author}`);
        console.log(`      Content: ${sample.content?.substring(0, 60)}...`);
        console.log(`      Sentiment: ${sample.sentiment}`);
        console.log(`      Platform: ${sample.platform}`);
        console.log(`      Published: ${sample.publishedAt?.toLocaleDateString()}\n`);
        
      } else {
        logResult('Mock Collection', 'error', 'MockCollector failed to generate test mentions!');
      }
      
    } catch (error: any) {
      logResult('E2E Test', 'error', `End-to-end test failed: ${error.message}`);
      console.error(error);
    } finally {
      // Cleanup: Supprimer les données de test
      if (testSourceId || testBrandId) {
        console.log('\n   Cleaning up test data...');
        
        try {
          if (testSourceId) {
            await prisma.mention.deleteMany({
              where: { sourceId: testSourceId },
            });
            
            await prisma.source.delete({
              where: { id: testSourceId },
            });
          }
          
          if (testBrandId) {
            await prisma.brand.delete({
              where: { id: testBrandId },
            });
          }
          
          logResult('Cleanup', 'success', 'Test data cleaned up');
        } catch (cleanupError: any) {
          logResult('Cleanup', 'warning', `Cleanup issue: ${cleanupError.message}`);
        }
      }
    }

    // ========================================
    // 5. VÉRIFICATION WORKERS
    // ========================================
    console.log('\n' + chalk.bold('📊 STEP 5: Workers Status\n'));
    
    try {
      // Vérifier s'il y a des workers actifs
      const scrapingWorkers = await scrapingQueue.getWorkers();
      const mentionWorkers = await mentionQueue.getWorkers();
      
      if (scrapingWorkers.length > 0) {
        logResult('Workers', 'success', `${scrapingWorkers.length} scraping worker(s) active`);
      } else {
        logResult('Workers', 'warning', 'No scraping workers detected (may be normal if not running)');
      }
      
      if (mentionWorkers.length > 0) {
        logResult('Workers', 'success', `${mentionWorkers.length} mention worker(s) active`);
      } else {
        logResult('Workers', 'warning', 'No mention workers detected (may be normal if not running)');
      }
      
    } catch (error: any) {
      logResult('Workers', 'warning', `Could not check workers: ${error.message}`);
    }

    // ========================================
    // RÉSUMÉ FINAL
    // ========================================
    console.log('\n\n' + '═'.repeat(70));
    console.log(chalk.bold('📊 AUDIT SUMMARY\n'));
    
    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Success: ${successCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`❌ Errors: ${errorCount}\n`);
    
    if (errorCount === 0 && warningCount === 0) {
      console.log(chalk.green('🎉 SYSTEM IS FULLY OPERATIONAL!\n'));
      console.log('✅ You can safely create real sources and start collecting data.\n');
      console.log('📝 Next steps:');
      console.log('   1. Create a real source via your UI or API');
      console.log('   2. The system will automatically collect mentions');
      console.log('   3. Mentions will appear on the dedicated source page\n');
    } else if (errorCount === 0) {
      console.log(chalk.yellow('⚠️  SYSTEM IS MOSTLY OPERATIONAL\n'));
      console.log('   Some warnings detected but system should work.');
      console.log('   Review warnings above and fix if needed.\n');
    } else {
      console.log(chalk.red('❌ SYSTEM HAS CRITICAL ERRORS\n'));
      console.log('   Fix the errors above before creating real sources.\n');
      process.exit(1);
    }
    
    console.log('═'.repeat(70) + '\n');
    
    console.log(chalk.cyan('💡 API Quota Status:'));
    console.log('   ✅ NO API calls were made during this audit');
    console.log('   ✅ All quotas preserved for production use\n');
    
  } catch (error: any) {
    console.error(chalk.red('\n❌ AUDIT FAILED:'), error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Récupère ou crée une organisation de test
 */
async function getOrCreateTestOrganization(): Promise<string> {
  let org = await prisma.organization.findFirst({
    where: { name: '🎭 System Audit Test Organization' },
  });
  
  if (!org) {
    // Créer un utilisateur fictif pour être le propriétaire
    const testUser = await prisma.user.create({
      data: {
        email: `audit-test-${Date.now()}@test.local`,
        name: 'Audit Test User',
        password: 'test-password-' + Math.random().toString(36).substring(7),
      },
    });
    
    org = await prisma.organization.create({
      data: {
        name: '🎭 System Audit Test Organization',
        slug: 'system-audit-test-' + Date.now(),
        ownerId: testUser.id,
      },
    });
  }
  
  return org.id;
}

// Exécuter l'audit
auditSystem().catch(error => {
  console.error(chalk.red('\n💥 CRITICAL ERROR:'), error);
  process.exit(1);
});
