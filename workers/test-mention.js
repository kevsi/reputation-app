import { mentionQueue } from './src/lib/queues';

async function testMentionProcessing() {
  console.log('🧪 Testing mention processing pipeline...');

  // Créer une mention de test
  const testMention = {
    text: "This is a great product! I love using it every day.",
    platform: "TEST",
    externalId: "test-mention-123",
    sourceId: "test-source-456",
    url: "https://example.com/test",
    author: "TestUser",
    publishedAt: new Date().toISOString(),
    metadata: {}
  };

  try {
    // Ajouter le job à la queue
    const job = await mentionQueue.add('process-mention', testMention, {
      priority: 1,
      delay: 1000 // Délai de 1 seconde
    });

    console.log(`✅ Job ajouté à la queue avec ID: ${job.id}`);
    console.log('📝 Données du job:', testMention);

    // Attendre un peu pour que le worker traite le job
    setTimeout(async () => {
      const jobState = await job.getState();
      console.log(`📊 État du job: ${jobState}`);

      if (jobState === 'completed') {
        const result = await job.returnvalue;
        console.log('🎉 Job terminé avec succès:', result);
      } else if (jobState === 'failed') {
        const failedReason = await job.failedReason;
        console.log('❌ Job échoué:', failedReason);
      }

      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du job:', error);
    process.exit(1);
  }
}

testMentionProcessing();