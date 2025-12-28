# AI-Powered Chat System with Slack Integration

Complete implementation of an AI-first customer support system with seamless human handoff via Slack.

## Architecture Overview

- **Backend**: Node.js with Express
- **Database**: PostgreSQL (conversations, messages, events)
- **Cache/Queue**: Redis (debounce, locks, job queue)
- **AI**: Gemini 3 Pro Preview
- **Human Console**: Slack (thread-per-conversation)
- **Real-time**: Server-Sent Events (SSE)
- **Frontend**: React widget

## Features

- AI-first responses with automatic handoff detection
- Thread-based Slack integration for agent monitoring
- Debounce and batching for multi-message handling
- Distributed locks to prevent duplicate AI responses
- Real-time bidirectional communication
- State machine: AI_ACTIVE → HANDOFF_PENDING → HUMAN_ACTIVE → CLOSED
- Block Kit buttons for agent takeover/close actions
- Message mirroring between widget and Slack
- Mobile-responsive chat widget

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL
- Redis
- Slack workspace with admin access
- Gemini API key

### 1. Backend Setup

```bash
cd /path/to/chatwoot-livechat-integration

npm install

cp .env.example .env
# Edit .env with your credentials
```

### 2. Configure Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From a manifest"
3. Paste contents from `slack-manifest.yml`
4. Update URLs to your server domain
5. Install app to workspace
6. Copy Bot Token and Signing Secret to `.env`
7. Create a channel (e.g., `#support-inbox`) and add the bot

### 3. Run Migrations

```bash
npm run migrate
```

### 4. Start Services

Terminal 1 - API Server:
```bash
npm run dev
```

Terminal 2 - AI Worker:
```bash
npm run worker
```

### 5. Frontend Widget Setup

```bash
cd frontend
npm install
npm run dev
```

Build for production:
```bash
npm run build
# Output: dist/chat-widget.umd.js
```

### 6. Embed Widget in Website

Add to your HTML:

```html
<div id="chat-widget-root"></div>
<script src="https://your-domain.com/chat-widget.umd.js"></script>
<script>
  window.initChatWidget({
    containerId: 'chat-widget-root',
    apiUrl: 'https://your-api-domain.com/api',
    customerInfo: {
      customer_id: 'user_' + Date.now(),
      customer_name: 'John Doe',
      customer_email: 'john@example.com'
    },
    theme: 'light'
  });
</script>
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/chat
REDIS_URL=redis://localhost:6379

SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret
SLACK_SUPPORT_CHANNEL_ID=C1234567890

GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3-pro-preview

PORT=3000
NODE_ENV=production

DEBOUNCE_WINDOW_MS=3000
MAX_WAIT_MS=10000
LOCK_TTL_MS=60000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/:id` | Get conversation + messages |
| POST | `/api/conversations/:id/messages` | Send customer message |
| GET | `/api/conversations/:id/stream` | SSE stream |
| POST | `/slack/events` | Slack Events API |
| POST | `/slack/interactions` | Slack Interactivity |

## How It Works

### Customer Sends Message

1. Widget → Backend: POST message
2. Backend saves to database
3. Backend mirrors to Slack thread
4. Backend sets debounce timer in Redis
5. Backend enqueues AI job

### AI Worker Processes

1. Worker checks debounce window
2. Acquires distributed lock
3. Loads conversation history from DB
4. Calls Gemini with system instructions
5. Splits response if needed
6. Sends parts to widget (SSE) + Slack
7. Updates last handled message ID
8. Releases lock
9. If `[HANDOFF_REQUESTED]` → post Slack buttons

### Agent Takes Over

1. Agent clicks "Take Over" button in Slack
2. Backend receives interaction payload
3. Updates conversation mode to `HUMAN_ACTIVE`
4. Posts confirmation to Slack thread
5. Sends status update to widget via SSE
6. AI stops responding to new messages

### Agent Replies

1. Agent types in Slack thread
2. Slack sends `message` event to backend
3. Backend verifies it's thread reply (not bot)
4. Backend saves to database
5. Backend relays to widget via SSE
6. Customer sees agent reply in real-time

### Handoff Detection

AI triggers handoff by including `[HANDOFF_REQUESTED]` in response when:
- Customer explicitly asks for human
- AI cannot resolve after 2 attempts
- Billing/refund requests
- Customer frustration detected

## Customizing System Prompt

Edit `src/config/system-prompts/default.txt` to customize AI behavior:

- Adjust handoff criteria
- Change response style
- Add domain-specific knowledge
- Modify tone and personality

## Deployment

### Backend (Recommended: Railway, Render, Fly.io)

```bash
# Build is not needed (Node.js runs directly)
npm start
```

Required services:
- PostgreSQL database
- Redis instance
- Environment variables configured

### Worker

Deploy as separate service or same container:

```bash
npm run worker
```

Or use process manager:
```bash
npm install -g pm2
pm2 start src/app.js --name api
pm2 start src/workers/ai-responder.js --name worker
```

### Frontend

Build and serve static files:

```bash
cd frontend
npm run build
# Upload dist/chat-widget.umd.js to CDN
```

## Monitoring

Key metrics to track:
- Average AI response time
- Handoff rate (AI → Human)
- Messages per conversation
- Active conversations
- Redis queue depth
- Database query performance

## Troubleshooting

### Messages not appearing in Slack

- Verify bot is in the channel
- Check `slack_channel_id` in database matches
- Review Slack API logs

### AI not responding

- Check worker is running
- Verify Gemini API key
- Check Redis connection
- Review worker logs for errors

### Duplicate messages

- Verify lock acquisition working
- Check Redis TTL settings
- Review Slack event deduplication

### SSE connection drops

- Implement reconnection in frontend (already included)
- Check server timeout settings
- Consider WebSocket upgrade for high-traffic

## Security Considerations

- Always verify Slack request signatures
- Use HTTPS in production
- Sanitize user input before storing
- Rate limit public endpoints
- Rotate Slack tokens regularly
- Encrypt sensitive customer data
- Set up CORS properly

## Cost Estimates (per 1000 conversations)

- **Gemini API**: ~$0.50-2.00 (depends on context length)
- **PostgreSQL**: Minimal (covered by most hosting plans)
- **Redis**: Minimal (few MB per day)
- **Slack**: Free (within workspace limits)

## Support

For issues or questions:
1. Check logs: `pm2 logs` or container logs
2. Verify environment variables
3. Test Slack webhooks with Request URL
4. Review database for conversation state

## License

MIT




