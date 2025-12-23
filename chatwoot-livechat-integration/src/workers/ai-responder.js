import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import orchestrator from '../services/orchestrator.js';
import config from '../config/index.js';

const redis = new Redis(config.redis.url);

const worker = new Worker(
  'ai-responses',
  async (job) => {
    const { conversationId } = job.data;
    console.log(`Processing AI response for conversation: ${conversationId}`);
    
    try {
      await orchestrator.processAIResponse(conversationId);
      console.log(`✓ Completed AI response for conversation: ${conversationId}`);
    } catch (error) {
      console.error(`✗ Error processing conversation ${conversationId}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 }
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('AI Worker started and waiting for jobs...');

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await worker.close();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...');
  await worker.close();
  await redis.quit();
  process.exit(0);
});


