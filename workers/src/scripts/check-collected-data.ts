// src/scripts/check-collected-data.ts
import { prisma } from '../config/database';

async function checkCollectedData() {
  console.log('🔍 Vérification des données collectées...\n');

  // 1. Compter les mentions collectées
  const mentionsCount = await prisma.mention.count();
  console.log(`📊 Total mentions collectées: ${mentionsCount}`);

  // 2. Mentions récentes (dernières 24h)
  const recentMentions = await prisma.mention.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      source: {
        select: {
          name: true,
          type: true
        }
      }
    }
  });

  console.log(`\n📅 Mentions des dernières 24h: ${recentMentions.length}`);
  
  if (recentMentions.length > 0) {
    console.log('\n🔥 Dernières mentions:');
    recentMentions.forEach((mention, i) => {
      console.log(`\n${i + 1}. ${mention.source.name} (${mention.source.type})`);
      console.log(`   📝 Contenu: ${mention.content?.substring(0, 100)}...`);
      console.log(`   ⏰ Collectée: ${mention.createdAt}`);
      console.log(`   💯 Sentiment: ${mention.sentiment || 'N/A'}`);
    });
  }

  // 3. Statistiques par source
  const statsBySource = await prisma.mention.groupBy({
    by: ['sourceId'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  });

  console.log('\n📊 Mentions par source:');
  for (const stat of statsBySource) {
    const source = await prisma.source.findUnique({
      where: { id: stat.sourceId },
      select: { name: true, type: true }
    });
    console.log(`   ${source?.name} (${source?.type}): ${stat._count.id} mentions`);
  }

  // 4. Vérifier les jobs en cours dans BullMQ
  console.log('\n⏳ État des jobs BullMQ:');
  // Note: nécessite d'importer vos queues
  
  await prisma.$disconnect();
}

checkCollectedData().catch(console.error);