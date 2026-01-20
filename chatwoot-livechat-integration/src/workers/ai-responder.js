import bullmq from 'bullmq';
const { Worker } = bullmq;
import { Redis } from 'ioredis';
import orchestrator from '../services/orchestrator.js';
import config from '../config/index.js';

const redisUrl = config.redis.url;
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  connectTimeout: 10000
};

if (redisUrl.startsWith('rediss://')) {
  redisOptions.tls = {
    rejectUnauthorized: true
  };
}

const redis = new Redis(redisUrl, redisOptions);

redis.on('error', (err) => {
  console.error('Redis error in worker:', err.message);
});

redis.on('connect', () => {
  console.log('✓ Worker connected to Redis');
});

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
    concurrency: 2,
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
    drainDelay: 10,
    stalledInterval: 60000,
    lockDuration: 60000
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


