# Setup Instructions

## 1. Environment Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/chat

# Redis
REDIS_URL=redis://localhost:6379

# Slack - Get these from https://api.slack.com/apps
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_SUPPORT_CHANNEL_ID=C1234567890

# Gemini - Get from https://ai.google.dev/
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-3-pro-preview

# Server
PORT=3000
NODE_ENV=development

# Orchestrator Settings
DEBOUNCE_WINDOW_MS=3000
MAX_WAIT_MS=10000
LOCK_TTL_MS=60000
```

## 2. Getting Your Credentials

### Slack App Setup

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From a manifest"
3. Select your workspace
4. Copy the contents of `slack-manifest.yml` and paste
5. Update the request URLs to your server domain (or use ngrok for local testing)
6. Click "Create"
7. Go to "OAuth & Permissions" → Copy the "Bot User OAuth Token" (starts with `xoxb-`)
8. Go to "Basic Information" → "App Credentials" → Copy "Signing Secret"
9. Go to "Install App" → Click "Install to Workspace"
10. Create a channel in Slack (e.g., `#support-inbox`)
11. Invite the bot: `/invite @Support Bot`
12. Right-click the channel → "View channel details" → Copy the Channel ID (at bottom)

### Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API Key" in Google AI Studio
3. Create a new API key
4. Copy the key

### PostgreSQL (Local Development)

Using Docker:
```bash
docker-compose up -d postgres
```

Or install locally:
- macOS: `brew install postgresql`
- Ubuntu: `apt-get install postgresql`

Default connection: `postgresql://postgres:postgres@localhost:5432/chat`

### Redis (Local Development)

Using Docker:
```bash
docker-compose up -d redis
```

Or install locally:
- macOS: `brew install redis`
- Ubuntu: `apt-get install redis`

Default connection: `redis://localhost:6379`

## 3. Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## 4. Database Setup

```bash
npm run migrate
```

## 5. Running Locally

### Option A: Separate Terminals

Terminal 1 - Database & Redis:
```bash
docker-compose up -d postgres redis
```

Terminal 2 - API Server:
```bash
npm run dev
```

Terminal 3 - AI Worker:
```bash
npm run worker
```

Terminal 4 - Frontend Widget:
```bash
cd frontend
npm run dev
```

### Option B: Production Mode (Docker)

```bash
docker-compose up
```

## 6. Testing with ngrok (for Slack webhooks)

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start ngrok
ngrok http 3000

# Update Slack app URLs:
# - Events URL: https://your-ngrok-url.ngrok.io/slack/events
# - Interactivity URL: https://your-ngrok-url.ngrok.io/slack/interactions
```

## 7. Verify Setup

1. Check health endpoint: http://localhost:3000/health
2. Open frontend: http://localhost:5173 (Vite dev server)
3. Send a test message
4. Check Slack channel for thread
5. Reply in Slack, verify it appears in widget

## Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL in .env
- Test connection: `psql $DATABASE_URL`

### "Cannot connect to Redis"
- Ensure Redis is running: `docker-compose ps`
- Check REDIS_URL in .env
- Test connection: `redis-cli -u $REDIS_URL ping`

### "Slack events not received"
- Verify ngrok is running
- Check Slack app Event Subscriptions page shows "Verified"
- Check server logs for signature verification errors
- Ensure SLACK_SIGNING_SECRET is correct

### "AI not responding"
- Check worker is running
- Verify GEMINI_API_KEY is valid
- Check worker logs for errors
- Verify Redis connection

### "Messages not appearing in Slack"
- Verify bot is invited to channel
- Check SLACK_SUPPORT_CHANNEL_ID matches your channel
- Verify SLACK_BOT_TOKEN is correct
- Check API server logs




