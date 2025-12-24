import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { setupQueues } from './queues/queue.config';
import { 
  analysisProcessor,
  reportsProcessor,
  notificationsProcessor,
  cleanupProcessor,
  aggregationProcessor
} from './processors';

dotenv.config();

async function bootstrap() {
  try {
    logger.info('🚀 Starting Sentinelle Workers...');

    // Configuration des queues et des processors
    const queues = setupQueues();

    // Analysis Queue
    queues.analysisQueue.process(10, analysisProcessor);
    
    // Reports Queue
    queues.reportsQueue.process(5, reportsProcessor);
    
    // Notifications Queue
    queues.notificationsQueue.process(20, notificationsProcessor);
    
    // Cleanup Queue
    queues.cleanupQueue.process(1, cleanupProcessor);
    
    // Aggregation Queue
    queues.aggregationQueue.process(3, aggregationProcessor);

    // Event listeners
    Object.values(queues).forEach((queue) => {
      queue.on('completed', (job) => {
        logger.info(`Job ${job.id} completed`, { 
          queue: queue.name,
          data: job.data 
        });
      });

      queue.on('failed', (job, err) => {
        logger.error(`Job ${job?.id} failed`, { 
          queue: queue.name,
          error: err.message,
          data: job?.data 
        });
      });

      queue.on('stalled', (job) => {
        logger.warn(`Job ${job.id} stalled`, { 
          queue: queue.name 
        });
      });
    });

    logger.info('✅ All workers started successfully');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing workers...');
      await Promise.all(
        Object.values(queues).map(q => q.close())
      );
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start workers', error);
    process.exit(1);
  }
}

bootstrap();