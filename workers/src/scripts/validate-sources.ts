/**
 * ✅ Validate Sources Script
 * 
 * Identifies sources in database that use disabled collectors
 * Helps identify data integrity issues and plan migrations
 * 
 * Usage:
 *   npx ts-node src/scripts/validate-sources.ts
 *   npx ts-node src/scripts/validate-sources.ts --fix
 *   npx ts-node src/scripts/validate-sources.ts --delete-disabled
 */

import { PrismaClient, Source } from '@sentinelle/database';
import { isCollectorEnabled, getCollectorReason, isValidCollectorType } from '../config/collectors.config';

const prisma = new PrismaClient();

interface ValidationResult {
  total: number;
  valid: number;
  disabled: DisabledSource[];
  invalid: InvalidSource[];
}

interface DisabledSource {
  id: string;
  type: string;
  name: string;
  reason: string;
  isActive: boolean;
}

interface InvalidSource {
  id: string;
  type: string;
  name: string;
}

/**
 * Main validation function
 */
async function validateSources(options: {
  fix?: boolean;
  deleteDisabled?: boolean;
  verbose?: boolean;
}): Promise<void> {
  console.log('🔍 Validating sources in database...\n');

  const result: ValidationResult = {
    total: 0,
    valid: 0,
    disabled: [],
    invalid: []
  };

  try {
    // Get all sources
    const sources = await prisma.source.findMany({
      select: {
        id: true,
        type: true,
        name: true,
        isActive: true
      }
    });

    result.total = sources.length;
    console.log(`📊 Total sources found: ${result.total}\n`);

    // Validate each source
    for (const source of sources) {
      // Check if type is valid
      if (!isValidCollectorType(source.type)) {
        result.invalid.push({
          id: source.id,
          type: source.type,
          name: source.name
        });
        continue;
      }

      // Check if collector is enabled
      if (!isCollectorEnabled(source.type)) {
        const reason = getCollectorReason(source.type as any);
        result.disabled.push({
          id: source.id,
          type: source.type,
          name: source.name,
          reason: reason || 'No reason provided',
          isActive: source.isActive
        });
      } else {
        result.valid++;
      }
    }

    // Display results
    displayResults(result, options);

    // Handle --fix option
    if (options.fix && result.disabled.length > 0) {
      await fixDisabledSources(result.disabled);
    }

    // Handle --delete-disabled option
    if (options.deleteDisabled && result.disabled.length > 0) {
      await deleteDisabledSources(result.disabled);
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Display validation results
 */
function displayResults(result: ValidationResult, options: any): void {
  console.log('📋 VALIDATION RESULTS\n');
  console.log(`✅ Valid sources: ${result.valid}`);
  console.log(`⚠️  Sources with disabled collectors: ${result.disabled.length}`);
  console.log(`❌ Sources with invalid types: ${result.invalid.length}\n`);

  // Display disabled sources
  if (result.disabled.length > 0) {
    console.log('⏭️  DISABLED COLLECTORS:');
    console.log('─'.repeat(80));
    for (const source of result.disabled) {
      console.log(`  ID: ${source.id}`);
      console.log(`  Type: ${source.type}`);
      console.log(`  Name: ${source.name}`);
      console.log(`  Status: ${source.isActive ? 'ACTIVE' : 'INACTIVE'}`);
      console.log(`  Reason: ${source.reason}`);
      console.log('');
    }
  }

  // Display invalid sources
  if (result.invalid.length > 0) {
    console.log('❌ INVALID TYPES:');
    console.log('─'.repeat(80));
    for (const source of result.invalid) {
      console.log(`  ID: ${source.id}`);
      console.log(`  Type: ${source.type} (NOT RECOGNIZED)`);
      console.log(`  Name: ${source.name}`);
      console.log('');
    }
  }

  // Display recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (result.disabled.length > 0) {
    console.log(`  • ${result.disabled.length} source(s) use disabled collectors`);
    if (result.disabled.some(s => s.isActive)) {
      console.log(`    Run with --fix to deactivate them automatically`);
    }
    console.log(`    Run with --delete-disabled to remove them completely`);
  }
  if (result.invalid.length > 0) {
    console.log(`  • ${result.invalid.length} source(s) have invalid types`);
    console.log(`    These sources need manual review and correction`);
  }
}

/**
 * Deactivate sources with disabled collectors
 */
async function fixDisabledSources(sources: DisabledSource[]): Promise<void> {
  console.log('\n🔧 FIXING DISABLED SOURCES...\n');

  const activeDisabledSources = sources.filter(s => s.isActive);
  
  if (activeDisabledSources.length === 0) {
    console.log('ℹ️  All disabled sources are already inactive.');
    return;
  }

  for (const source of activeDisabledSources) {
    try {
      await prisma.source.update({
        where: { id: source.id },
        data: { isActive: false }
      });
      console.log(`✅ Deactivated: ${source.name} (${source.type})`);
    } catch (error) {
      console.error(`❌ Failed to deactivate ${source.id}:`, error);
    }
  }

  console.log(`\n✅ Fixed ${activeDisabledSources.length} source(s)`);
}

/**
 * Delete sources with disabled collectors
 */
async function deleteDisabledSources(sources: DisabledSource[]): Promise<void> {
  console.log('\n🗑️  DELETING DISABLED SOURCES...\n');
  console.log('⚠️  WARNING: This will permanently delete sources!\n');

  const deleteCount = sources.length;
  
  for (const source of sources) {
    try {
      await prisma.source.delete({
        where: { id: source.id }
      });
      console.log(`🗑️  Deleted: ${source.name} (${source.type})`);
    } catch (error) {
      console.error(`❌ Failed to delete ${source.id}:`, error);
    }
  }

  console.log(`\n✅ Deleted ${deleteCount} source(s)`);
}

/**
 * Parse command line arguments
 */
function parseArguments(): any {
  const args = process.argv.slice(2);
  return {
    fix: args.includes('--fix'),
    deleteDisabled: args.includes('--delete-disabled'),
    verbose: args.includes('--verbose')
  };
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const options = parseArguments();
  await validateSources(options);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
