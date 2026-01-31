#!/usr/bin/env node

/**
 * 🔍 Collector Status Checker
 * 
 * Display the status of all collectors in the system:
 * - Enabled/disabled
 * - Registered/not registered
 * - Rate limits and descriptions
 * 
 * Usage:
 *   npx ts-node src/scripts/check-collectors.ts
 */

import { CollectorFactory } from '../collectors'
import {
  getEnabledCollectorTypes,
  getDisabledCollectorTypes,
  AVAILABLE_COLLECTORS,
  isCollectorEnabled,
} from '../config/collectors.config'

function printCollectorTable(): void {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗')
  console.log('║                    COLLECTOR STATUS OVERVIEW                           ║')
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n')

  const enabledTypes = getEnabledCollectorTypes()
  const disabledTypes = getDisabledCollectorTypes()

  // ENABLED COLLECTORS
  console.log('✅ ENABLED COLLECTORS:\n')
  console.log('  Type              Status       Rate Limit          Auth     Description')
  console.log('  ─────────────────────────────────────────────────────────────────────────')

  for (const type of enabledTypes) {
    const config = AVAILABLE_COLLECTORS[type]
    const isRegistered = CollectorFactory.isRegistered(type)
    const status = isRegistered ? '✓ Registered' : '✗ Not registered'
    
    let rateLimitStr = 'Unlimited'
    if (config && 'rateLimit' in config && config.rateLimit && typeof config.rateLimit === 'object') {
      rateLimitStr = `${config.rateLimit.requests}/${config.rateLimit.per}`
    }
    
    let authStr = 'No'
    if (config && 'requiresAuth' in config && config.requiresAuth === true) {
      authStr = 'Yes'
    }
    
    let desc = ''
    if (config && 'description' in config && config.description) {
      desc = config.description.substring(0, 30)
    }
    
    const typeCol = type.padEnd(17)
    const statusCol = status.padEnd(12)
    const rateCol = rateLimitStr.padEnd(19)
    const authCol = authStr.padEnd(8)
    
    console.log(`  ${typeCol} ${statusCol} ${rateCol} ${authCol} ${desc}`)
  }

  console.log('')

  // DISABLED COLLECTORS
  if (disabledTypes.length > 0) {
    console.log('\n🚫 DISABLED COLLECTORS:\n')
    console.log('  Type              Reason                           Alternative')
    console.log('  ────────────────────────────────────────────────────────────────────')

    for (const item of disabledTypes) {
      const typeCol = item.type.padEnd(17)
      const reasonStr = (item.reason || 'Unknown').substring(0, 30).padEnd(30)
      const altStr = item.alternative ? item.alternative.substring(0, 40) : 'N/A'
      
      console.log(`  ${typeCol} ${reasonStr} ${altStr}`)
    }
    console.log('')
  }
}

function printRegistryStatus(): void {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗')
  console.log('║                   COLLECTOR REGISTRY STATUS                            ║')
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n')

  const registered = CollectorFactory.getRegisteredCollectors()
  const enabledTypes = getEnabledCollectorTypes()

  console.log(`  Total enabled in config:    ${enabledTypes.length}`)
  console.log(`  Total registered in memory: ${registered.length}`)
  console.log('')

  if (registered.length > 0) {
    console.log('  Registered collectors:')
    for (const type of registered) {
      console.log(`    ✓ ${type}`)
    }
  } else {
    console.log('  ⚠️  No collectors registered in memory!')
  }

  // Check for mismatches
  const enabledButNotRegistered = enabledTypes.filter(
    (type) => !registered.includes(type)
  )

  if (enabledButNotRegistered.length > 0) {
    console.log('\n  ⚠️  Enabled but NOT registered:')
    for (const type of enabledButNotRegistered) {
      console.log(`    ✗ ${type}`)
    }
  }

  console.log('')
}

function printDetailedInfo(): void {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗')
  console.log('║                    DETAILED COLLECTOR INFO                             ║')
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n')

  const enabledTypes = getEnabledCollectorTypes()

  for (const type of enabledTypes) {
    const config = AVAILABLE_COLLECTORS[type]
    const info = CollectorFactory.getCollectorInfo(type)

    console.log(`\n  📌 ${type}`)
    console.log(`     Status: ${CollectorFactory.isRegistered(type) ? '✓ Registered' : '✗ Not registered'}`)
    
    if (config && 'description' in config && config.description) {
      console.log(`     Description: ${config.description}`)
    }
    
    if (config && 'requiresAuth' in config && config.requiresAuth === true) {
      console.log(`     Requires auth: Yes`)
    }
    
    if (config && 'rateLimit' in config && config.rateLimit && typeof config.rateLimit === 'object') {
      console.log(`     Rate limit: ${config.rateLimit.requests} requests per ${config.rateLimit.per}`)
    }
  }

  // Disabled collectors info
  const disabledTypes = getDisabledCollectorTypes()
  if (disabledTypes.length > 0) {
    console.log('\n\n  🚫 DISABLED COLLECTORS:\n')
    for (const item of disabledTypes) {
      const config = AVAILABLE_COLLECTORS[item.type]
      console.log(`\n  📌 ${item.type}`)
      console.log(`     Status: Disabled`)
      console.log(`     Reason: ${item.reason}`)
      if (item.alternative) {
        console.log(`     Alternative: ${item.alternative}`)
      }
    }
  }

  console.log('')
}

function printSummary(): void {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗')
  console.log('║                         SUMMARY & RECOMMENDATIONS                      ║')
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n')

  const enabledTypes = getEnabledCollectorTypes()
  const registered = CollectorFactory.getRegisteredCollectors()
  const disabledTypes = getDisabledCollectorTypes()

  console.log(`  ✅ Enabled collectors:  ${enabledTypes.length}`)
  console.log(`  📦 Registered:          ${registered.length}/${enabledTypes.length}`)
  console.log(`  🚫 Disabled collectors: ${disabledTypes.length}`)
  console.log('')

  // Health checks
  console.log('  Health Checks:')

  if (registered.length === enabledTypes.length) {
    console.log('    ✅ All enabled collectors are registered')
  } else {
    console.log(`    ⚠️  ${enabledTypes.length - registered.length} enabled collectors are NOT registered`)
  }

  if (disabledTypes.length === 0) {
    console.log('    ✅ No disabled collectors')
  } else {
    console.log(`    ℹ️  ${disabledTypes.length} collectors are disabled`)
  }

  console.log('')

  // Recommendations
  if (registered.length < enabledTypes.length) {
    console.log('  💡 Recommendations:')
    console.log('    • Check collector initialization in src/collectors/index.ts')
    console.log('    • Ensure all collectors are imported and registered')
    console.log('    • Check for import errors or missing dependencies')
    console.log('')
  }
}

async function main(): Promise<void> {
  try {
    // Initialize collectors
    console.log('🔍 Initializing collector registry...\n')
    CollectorFactory.initialize()

    printCollectorTable()
    printRegistryStatus()
    printDetailedInfo()
    printSummary()

    console.log('✅ Collector status check complete!\n')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
