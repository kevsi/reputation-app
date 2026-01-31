// src/scripts/check-sources-status.ts
import { prisma } from '../config/database';

async function checkSources() {
  const sources = await prisma.source.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      isActive: true,
      _count: {
        select: { mentions: true }
      }
    }
  });

  console.log('\n📋 État de toutes les sources:\n');
  sources.forEach(source => {
    const status = source.isActive ? '✅ ACTIVE' : '❌ INACTIVE';
    console.log(`${status} - ${source.name} (${source.type})`);
    console.log(`   ID: ${source.id}`);
    console.log(`   Mentions collectées: ${source._count.mentions}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkSources().catch(console.error);