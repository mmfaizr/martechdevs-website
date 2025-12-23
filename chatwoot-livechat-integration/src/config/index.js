import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadSystemPrompt = () => {
  try {
    return readFileSync(join(__dirname, 'system-prompts', 'default.txt'), 'utf-8');
  } catch (error) {
    console.warn('Could not load system prompt file, using default');
    return `You are a helpful customer support assistant.

## Handoff Rules
Request human handoff when:
- Customer explicitly asks for a human
- You cannot resolve the issue after 2 attempts
- Billing disputes or refund requests
- Customer expresses frustration

When handoff is needed, end your response with:
[HANDOFF_REQUESTED]

## Response Style
- Be concise and helpful
- Ask clarifying questions when needed
- Provide step-by-step instructions for technical issues`;
  }
};

export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/chat'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    supportChannelId: process.env.SLACK_SUPPORT_CHANNEL_ID
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-3-pro-preview'
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  orchestrator: {
    debounceWindowMs: parseInt(process.env.DEBOUNCE_WINDOW_MS || '3000'),
    maxWaitMs: parseInt(process.env.MAX_WAIT_MS || '10000'),
    lockTtlMs: parseInt(process.env.LOCK_TTL_MS || '60000')
  },
  systemPrompt: loadSystemPrompt()
};

export default config;


