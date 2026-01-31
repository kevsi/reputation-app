#!/usr/bin/env node

/**
 * 🛠️ Source Management Script
 * 
 * Scan, validate, and manage sources in the database.
 * 
 * Usage:
 *   npx ts-node src/scripts/manage-sources.ts                 # Show status
 *   npx ts-node src/scripts/manage-sources.ts --deactivate    # Auto-deactivate forbidden sources
 *   npx ts-node src/scripts/manage-sources.ts --report         # Generate detailed report
 */

import { PrismaClient } from '@sentinelle/database'
import {
  isCollectorEnabled,
  getCollectorReason,
  getUnavailableCollectorMessage,
  getDisabledCollectorTypes,
  getEnabledCollectorTypes,
  isValidCollectorType,
} from '../config/collectors.config'

const prisma = new PrismaClient()

interface SourceStatus {
  id: string
  type: string
  brand: string
  url?: string
  isActive: boolean
  collectorEnabled: boolean
  reason?: string
  alternative?: string
}

interface ScanResult {
  total: number
  active: number
  inactive: number
  valid: number
  forbidden: number
  unknownType: number
  validActive: SourceStatus[]
  forbiddenActive: SourceStatus[]
  unknownActive: SourceStatus[]
}

async function scanSources(): Promise<ScanResult> {
  console.log('\n📊 SCANNING SOURCES...\n')

  const sources = await prisma.source.findMany({
    include: {
      brand: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })

  const result: ScanResult = {
    total: sources.length,
    active: 0,
    inactive: 0,
    valid: 0,
    forbidden: 0,
    unknownType: 0,
    validActive: [],
    forbiddenActive: [],
    unknownActive: [],
  }

  const disabledTypes = getDisabledCollectorTypes()

  for (const source of sources) {
    if (source.isActive) {
      result.active++
    } else {
      result.inactive++
    }

    // Check if type is valid
    const isKnownType = getEnabledCollectorTypes().includes(source.type as any) || 
                       disabledTypes.some(d => d.type === source.type)

    if (!isKnownType) {
      result.unknownType++
      if (source.isActive) {
        result.unknownActive.push({
          id: source.id,
          type: source.type,
          brand: source.brand.name,
          url: (source.config as any)?.url,
          isActive: source.isActive,
          collectorEnabled: false,
          reason: 'Unknown collector type',
        })
      }
      continue
    }

    // Check if collector is enabled
    const enabled = isCollectorEnabled(source.type)

    if (enabled) {
      result.valid++
      if (source.isActive) {
        result.validActive.push({
          id: source.id,
          type: source.type,
          brand: source.brand.name,
          url: (source.config as any)?.url,
          isActive: source.isActive,
          collectorEnabled: true,
        })
      }
    } else {
      result.forbidden++
      const disabledInfo = disabledTypes.find(d => d.type === source.type)
      const reason = disabledInfo?.reason || (isValidCollectorType(source.type) ? getCollectorReason(source.type) : null)
      if (source.isActive) {
        result.forbiddenActive.push({
          id: source.id,
          type: source.type,
          brand: source.brand.name,
          url: (source.config as any)?.url,
          isActive: source.isActive,
          collectorEnabled: false,
          reason: reason || undefined,
        })
      }
    }
  }

  return result
}

function printStatus(result: ScanResult): void {
  console.log('╔═══════════════════════════════════════════════════════╗')
  console.log('║             SOURCE INVENTORY SUMMARY                  ║')
  console.log('╚═══════════════════════════════════════════════════════╝\n')

  console.log(`  📊 Total sources:        ${result.total}`)
  console.log(`  ✅ Active:               ${result.active}`)
  console.log(`  ⏸️  Inactive:             ${result.inactive}`)
  console.log('')

  console.log('  Collector Status:')
  console.log(`    ✅ Valid & enabled:    ${result.valid}`)
  console.log(`    🚫 Forbidden/disabled: ${result.forbidden}`)
  console.log(`    ❓ Unknown type:       ${result.unknownType}`)
  console.log('')

  // Summary of problematic sources
  console.log('  ⚠️  Issues:')
  if (result.forbiddenActive.length > 0) {
    console.log(`    🚫 Active sources with disabled collectors: ${result.forbiddenActive.length}`)
  }
  if (result.unknownActive.length > 0) {
    console.log(`    ❓ Active sources with unknown types: ${result.unknownActive.length}`)
  }
  if (result.forbiddenActive.length === 0 && result.unknownActive.length === 0) {
    console.log('    ✅ No issues detected!')
  }
  console.log('')
}

function printDetailedReport(result: ScanResult): void {
  console.log('\n╔═══════════════════════════════════════════════════════╗')
  console.log('║              DETAILED INVENTORY REPORT                ║')
  console.log('╚═══════════════════════════════════════════════════════╝\n')

  // Valid active sources
  if (result.validActive.length > 0) {
    console.log(`✅ VALID ACTIVE SOURCES (${result.validActive.length}):`)
    console.log('─'.repeat(55))
    for (const source of result.validActive) {
      console.log(`  ${source.id.substring(0, 8)}... | ${source.type.padEnd(15)} | ${source.brand}`)
    }
    console.log('')
  }

  // Forbidden active sources
  if (result.forbiddenActive.length > 0) {
    console.log(`🚫 FORBIDDEN ACTIVE SOURCES (${result.forbiddenActive.length}):`)
    console.log('─'.repeat(55))
    for (const source of result.forbiddenActive) {
      console.log(`  ${source.id.substring(0, 8)}... | ${source.type.padEnd(15)} | ${source.brand}`)
      if (source.reason) {
        console.log(`    └─ Reason: ${source.reason}`)
      }
    }
    console.log('')
  }

  // Unknown type sources
  if (result.unknownActive.length > 0) {
    console.log(`❓ UNKNOWN TYPE ACTIVE SOURCES (${result.unknownActive.length}):`)
    console.log('─'.repeat(55))
    for (const source of result.unknownActive) {
      console.log(`  ${source.id.substring(0, 8)}... | ${source.type.padEnd(15)} | ${source.brand}`)
    }
    console.log('')
  }
}

async function autoDeactivateForbidden(): Promise<number> {
  console.log('\n🔄 AUTO-DEACTIVATING FORBIDDEN SOURCES...\n')

  const result = await scanSources()

  if (result.forbiddenActive.length === 0 && result.unknownActive.length === 0) {
    console.log('✅ No sources to deactivate!\n')
    return 0
  }

  let deactivated = 0

  // Deactivate forbidden sources
  for (const source of result.forbiddenActive) {
    await prisma.source.update({
      where: { id: source.id },
      data: { isActive: false }
    })
    console.log(`  ✓ Deactivated ${source.id.substring(0, 8)}... (${source.type} → ${source.reason})`)
    deactivated++
  }

  // Deactivate unknown type sources
  for (const source of result.unknownActive) {
    await prisma.source.update({
      where: { id: source.id },
      data: { isActive: false }
    })
    console.log(`  ✓ Deactivated ${source.id.substring(0, 8)}... (unknown type: ${source.type})`)
    deactivated++
  }

  console.log(`\n✅ Deactivated ${deactivated} sources\n`)
  return deactivated
}

async function printCollectorReference(): Promise<void> {
  console.log('\n╔═══════════════════════════════════════════════════════╗')
  console.log('║            AVAILABLE COLLECTORS REFERENCE            ║')
  console.log('╚═══════════════════════════════════════════════════════╝\n')

  const enabledTypes = getEnabledCollectorTypes()
  const disabledTypes = getDisabledCollectorTypes()

  if (enabledTypes.length > 0) {
    console.log('✅ ENABLED:')
    for (const type of enabledTypes) {
      console.log(`   • ${type}`)
    }
  }

  if (disabledTypes.length > 0) {
    console.log('\n🚫 DISABLED:')
    for (const item of disabledTypes) {
      console.log(`   • ${item.type}`)
      if (item.reason) {
        console.log(`     Reason: ${item.reason}`)
      }
      if (item.alternative) {
        console.log(`     Alternative: ${item.alternative}`)
      }
    }
  }
  console.log('')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const deactivateFlag = args.includes('--deactivate')
  const reportFlag = args.includes('--report')

  try {
    const result = await scanSources()

    printStatus(result)

    if (reportFlag) {
      printDetailedReport(result)
    }

    if (deactivateFlag) {
      const deactivated = await autoDeactivateForbidden()
      if (deactivated > 0) {
        console.log('ℹ️  Run again without --deactivate to see updated status\n')
      }
    } else if (result.forbiddenActive.length > 0 || result.unknownActive.length > 0) {
      console.log('💡 Run with --deactivate to automatically fix these issues')
      console.log('💡 Run with --report for detailed inventory\n')
    }

    printCollectorReference()

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
