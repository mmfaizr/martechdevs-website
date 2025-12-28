import { Redis } from 'ioredis';
import bullmq from 'bullmq';
const { Queue, Worker } = bullmq;
import db from '../db/queries.js';
import geminiService from './gemini.js';
import slackService from './slack/client.js';
import realtimeService from './realtime.js';
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
  console.error('Redis error in orchestrator:', err.message);
});

redis.on('connect', () => {
  console.log('✓ Orchestrator connected to Redis');
});

const DEBOUNCE_WINDOW_MS = config.orchestrator.debounceWindowMs;
const MAX_WAIT_MS = config.orchestrator.maxWaitMs;
const LOCK_TTL_MS = config.orchestrator.lockTtlMs;

class Orchestrator {
  constructor() {
    this.queue = new Queue('ai-responses', {
      connection: redis
    });
  }

  async onCustomerMessage(conversationId, messageId) {
    const conversation = await db.getConversation(conversationId);
    
    if (conversation.mode !== 'AI_ACTIVE') {
      const message = await db.getMessage(messageId);
      try {
        await slackService.mirrorMessage(conversation, message);
      } catch (err) {
        console.warn('Slack mirror failed:', err.message);
      }
      return;
    }

    const now = Date.now();
    const stateKey = `conv:${conversationId}:state`;
    
    const state = await redis.hgetall(stateKey);
    const firstPendingAt = state.first_pending_at 
      ? parseInt(state.first_pending_at) 
      : now;

    await redis.hset(stateKey, {
      pending_until: now + DEBOUNCE_WINDOW_MS,
      first_pending_at: firstPendingAt,
      last_message_id: messageId
    });

    const delay = Math.min(
      DEBOUNCE_WINDOW_MS,
      MAX_WAIT_MS - (now - firstPendingAt)
    );

    await this.queue.add(
      'process-ai',
      { conversationId },
      { 
        delay: Math.max(delay, 0),
        jobId: `ai:${conversationId}:${Date.now()}`
      }
    );
  }

  async processAIResponse(conversationId) {
    const stateKey = `conv:${conversationId}:state`;
    const lockKey = `conv:${conversationId}:lock`;

    const state = await redis.hgetall(stateKey);
    const now = Date.now();

    if (state.pending_until && now < parseInt(state.pending_until)) {
      const delay = parseInt(state.pending_until) - now;
      await this.queue.add(
        'process-ai',
        { conversationId },
        { 
          delay: Math.max(delay, 0),
          jobId: `ai:${conversationId}:${Date.now()}`
        }
      );
      return;
    }

    const locked = await redis.set(lockKey, 'locked', 'PX', LOCK_TTL_MS, 'NX');
    if (!locked) {
      console.log(`Conversation ${conversationId} already locked`);
      return;
    }

    try {
      await this.generateAndSend(conversationId, state);
    } catch (error) {
      console.error('Error in processAIResponse:', error);
    } finally {
      await redis.del(lockKey);
    }
  }

  async generateAndSend(conversationId, state) {
    const conversation = await db.getConversation(conversationId);
    
    if (conversation.mode !== 'AI_ACTIVE') {
      console.log(`Conversation ${conversationId} no longer in AI_ACTIVE mode`);
      return;
    }

    const lastHandledId = conversation.last_customer_msg_id_handled || 0;

    const messages = await db.getMessages(conversationId);
    const allMessages = messages;
    const newCustomerMessages = messages.filter(m => 
      m.id > lastHandledId && 
      m.sender_type === 'customer'
    );

    if (newCustomerMessages.length === 0) {
      console.log(`No new messages for conversation ${conversationId}`);
      return;
    }

    const customerInput = newCustomerMessages.length === 1
      ? newCustomerMessages[0].content
      : newCustomerMessages.map((m, i) => `[${i + 1}] ${m.content}`).join('\n');

    console.log(`Generating AI response for conversation ${conversationId}`);
    const { text: aiResponse, needsHandoff } = await geminiService.generateResponse(
      allMessages.filter(m => m.sender_type !== 'human'),
      customerInput
    );

    const stateKey = `conv:${conversationId}:state`;
    const currentState = await redis.hgetall(stateKey);
    const latestMsgId = parseInt(currentState.last_message_id || 0);
    const lastNewMsgId = newCustomerMessages[newCustomerMessages.length - 1].id;

    if (latestMsgId > lastNewMsgId) {
      console.log(`New messages arrived during processing, rescheduling conversation ${conversationId}`);
      await this.queue.add(
        'process-ai',
        { conversationId },
        { 
          delay: DEBOUNCE_WINDOW_MS,
          jobId: `ai:${conversationId}:${Date.now()}`
        }
      );
      return;
    }

    const parts = this.splitResponse(aiResponse, 3000);

    for (const part of parts) {
      const message = await db.createMessage({
        conversation_id: conversationId,
        content: part,
        sender_type: 'ai'
      });

      console.log(`[AI] Sending AI message to SSE for conversation ${conversationId}`);
      realtimeService.sendToConversation(conversationId, {
        type: 'message',
        message: {
          id: message.id,
          content: part,
          sender_type: 'ai',
          created_at: message.created_at
        }
      });

      try {
        await slackService.mirrorMessage(conversation, message);
      } catch (err) {
        console.warn('Slack mirror failed:', err.message);
      }

      if (parts.length > 1) {
        await this.delay(200);
      }
    }

    await db.updateConversation(conversationId, {
      last_customer_msg_id_handled: lastNewMsgId
    });

    await redis.del(stateKey);

    if (needsHandoff) {
      console.log(`Handoff requested for conversation ${conversationId}`);
      await db.updateConversationMode(conversationId, 'HANDOFF_PENDING');
      
      try {
        await slackService.postHandoffRequest(
          conversation,
          'AI has determined this conversation needs human assistance.'
        );
      } catch (err) {
        console.warn('Slack handoff notification failed:', err.message);
      }
      
      realtimeService.sendToConversation(conversationId, {
        type: 'status',
        status: 'handoff_pending'
      });
    }
  }

  splitResponse(text, maxLength) {
    if (text.length <= maxLength) return [text];

    const parts = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        parts.push(remaining);
        break;
      }

      let breakPoint = remaining.lastIndexOf('\n\n', maxLength);
      if (breakPoint < maxLength / 2) {
        breakPoint = remaining.lastIndexOf('. ', maxLength);
      }
      if (breakPoint < maxLength / 2) {
        breakPoint = remaining.lastIndexOf(' ', maxLength);
      }
      if (breakPoint < 0) breakPoint = maxLength;

      parts.push(remaining.substring(0, breakPoint + 1).trim());
      remaining = remaining.substring(breakPoint + 1).trim();
    }

    return parts;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new Orchestrator();


