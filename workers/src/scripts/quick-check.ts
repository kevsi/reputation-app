#!/usr/bin/env node

/**
 * ⚡ QUICK SYSTEM CHECK (30 seconds)
 * 
 * Vérification rapide des connexions essentielles
 * Idéal pour vérifier que tout fonctionne avant chaque session
 * 
 * Usage:
 *   npx ts-node src/scripts/quick-check.ts
 * 
 * ✅ Ultra rapide - pas de tests longs
 * ✅ NO API CALLS
 * ✅ Perfect pour before dev sessions
 */

import { prisma } from '../config/database';
import { scrapingQueue } from '../lib/queues';
import { CollectorFactory } from '../collectors';
import chalk from 'chalk';

async function quickCheck() {
  console.log(chalk.bold('\n⚡ QUICK SYSTEM CHECK (30 seconds)\n'));
  console.log('═'.repeat(50) + '\n');
  
  let allOk = true;
  
  // 1. Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database: Connected');
  } catch (error) {
    console.log(chalk.red('❌ Database: FAILED'));
    allOk = false;
  }
  
  // 2. Redis
  try {
    await scrapingQueue.getJobCounts();
    console.log('✅ Redis/BullMQ: Connected');
  } catch (error) {
    console.log(chalk.red('❌ Redis/BullMQ: FAILED'));
    allOk = false;
  }
  
  // 3. Collectors
  try {
    // CollectorFactory is auto-initialized via collectors/index.ts import
    const registeredCollectors = CollectorFactory.getRegisteredCollectors();
    console.log(`✅ Collectors: System initialized (${registeredCollectors.length} collectors registered)`);
  } catch (error: any) {
    console.log(chalk.yellow(`⚠️  Collectors: ${error.message}`));
  }
  
  // 4. Sources actives
  try {
    const activeSources = await prisma.source.count({ where: { isActive: true } });
    console.log(`📊 Active Sources: ${activeSources}`);
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not check active sources'));
  }
  
  // 5. Mentions totales
  try {
    const totalMentions = await prisma.mention.count();
    console.log(`📊 Total Mentions: ${totalMentions}`);
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not count mentions'));
  }
  
  console.log('\n' + '═'.repeat(50));
  
  if (allOk) {
    console.log(chalk.green('\n✅ System operational - Ready for development\n'));
    await prisma.$disconnect();
    process.exit(0);
  } else {
    console.log(chalk.red('\n❌ System has critical issues\n'));
    console.log('Run full audit for details:\n');
    console.log(chalk.cyan('   npx ts-node src/scripts/audit-system.ts\n'));
    await prisma.$disconnect();
    process.exit(1);
  }
}

quickCheck().catch(error => {
  console.error(chalk.red('❌ Check failed:'), error);
  process.exit(1);
});
