# Production Deployment Guide

This guide covers deploying the AI chat system to production.

## Git Repositories

This project uses **two GitHub repositories**:

| Repo | Purpose | Render Service |
|------|---------|----------------|
| `mmfaizr/martechdevs-website` (origin) | Main website + chat widget | Vercel (website) |
| `mmfaizr/claychat` (claychat) | Chat backend API | Render (claychat-api, claychat-bg-worker) |

### Pushing Changes

**Always push to both repos** when making backend changes:

```bash
# From the main project directory
cd "/Users/faizur/Desktop/Martechpal/Martechdevs Website"

# Push to both remotes
git push origin main      # Website repo
git push claychat main    # Backend repo (triggers Render deploy)
```

Or push to both at once:
```bash
git push origin main && git push claychat main
```

### Verify Remotes
```bash
git remote -v
# Should show:
# claychat   git@github.com:mmfaizr/claychat.git
# origin     git@github.com:mmfaizr/martechdevs-website.git
```

## Architecture Overview

- **Backend API + Worker**: Node.js services (Railway, Render, or Fly.io)
- **Database**: Supabase PostgreSQL (already configured)
- **Cache/Queue**: Upstash Redis (already configured)
- **AI**: Google Gemini API
- **Chat Channel**: Slack
- **Frontend Widget**: CDN-hosted static files

## Option 1: Railway (Recommended)

### Why Railway?
- Easy setup with GitHub integration
- Free tier available
- Automatic HTTPS
- Built-in environment variables
- Can run multiple services (API + Worker)

### Step-by-Step Deployment

1. **Prepare Repository**
   ```bash
   cd /Users/faizur/Desktop/Martechpal/Martechdevs\ Website/chatwoot-livechat-integration
   git init
   git add .
   git commit -m "Initial commit - AI chat system"
   ```

2. **Push to GitHub**
   ```bash
   # Create a new repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/chat-system.git
   git push -u origin main
   ```

3. **Deploy to Railway**
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js

4. **Configure Environment Variables**
   In Railway dashboard, add these variables:
   ```
   DATABASE_URL=<your-supabase-url>
   REDIS_URL=<your-upstash-url>
   SLACK_BOT_TOKEN=<your-slack-token>
   SLACK_SIGNING_SECRET=<your-slack-secret>
   SLACK_SUPPORT_CHANNEL_ID=<your-channel-id>
   GEMINI_API_KEY=<your-gemini-key>
   GEMINI_MODEL=gemini-3-pro-preview
   PORT=3000
   NODE_ENV=production
   DEBOUNCE_WINDOW_MS=3000
   MAX_WAIT_MS=10000
   LOCK_TTL_MS=60000
   ```

5. **Deploy Worker as Separate Service**
   - In Railway, click "+ New Service"
   - Select same GitHub repo
   - In Settings → Start Command: `node src/workers/ai-responder.js`
   - Add same environment variables

6. **Get Production URL**
   - Railway provides: `https://your-app.up.railway.app`
   - Copy this URL

7. **Update Slack Webhooks**
   - Go to https://api.slack.com/apps → Your App
   - Event Subscriptions → Request URL: `https://your-app.up.railway.app/slack/events`
   - Interactivity → Request URL: `https://your-app.up.railway.app/slack/interactions`
   - Save changes

## Option 2: Render

### Deploy to Render

1. **Create render.yaml** (already provided in this repo)

2. **Push to GitHub** (same as Railway)

3. **Deploy**
   - Go to https://render.com
   - New → Blueprint
   - Connect your GitHub repo
   - Render will read `render.yaml` and deploy both services

4. **Configure Environment Variables**
   - Add all variables from Railway example above
   - Render dashboard → each service → Environment

5. **Update Slack Webhooks**
   - Use the Render URL in Slack configuration

## Option 3: Fly.io

### Deploy to Fly.io

1. **Install Fly CLI**
   ```bash
   brew install flyctl
   fly auth login
   ```

2. **Initialize**
   ```bash
   cd /Users/faizur/Desktop/Martechpal/Martechdevs\ Website/chatwoot-livechat-integration
   fly launch --no-deploy
   ```

3. **Set Environment Variables**
   ```bash
   fly secrets set DATABASE_URL="..." REDIS_URL="..." SLACK_BOT_TOKEN="..." \
     SLACK_SIGNING_SECRET="..." SLACK_SUPPORT_CHANNEL_ID="..." \
     GEMINI_API_KEY="..." GEMINI_MODEL="gemini-3-pro-preview" \
     NODE_ENV="production"
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

5. **Deploy Worker**
   ```bash
   fly launch --name your-app-worker --no-deploy
   # Update fly.toml CMD to: node src/workers/ai-responder.js
   fly deploy
   ```

## Frontend Widget Deployment

### Build Widget

```bash
cd frontend
npm run build
```

This creates `dist/chat-widget.umd.js`

### Option A: Deploy to Vercel/Netlify

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Option B: Host on CDN (Cloudflare/AWS S3)

1. Upload `dist/chat-widget.umd.js` to your CDN
2. Get the public URL
3. Use in your website

### Embed in Website

```html
<div id="chat-widget-root"></div>
<script src="https://your-cdn.com/chat-widget.umd.js"></script>
<script>
  window.initChatWidget({
    containerId: 'chat-widget-root',
    apiUrl: 'https://your-app.up.railway.app/api',
    customerInfo: {
      customer_id: 'user_' + Date.now(),
      customer_name: 'Customer Name',
      customer_email: 'customer@example.com'
    },
    theme: 'light'
  });
</script>
```

## Post-Deployment Checklist

- [ ] API server is accessible via HTTPS
- [ ] Worker is running and processing jobs
- [ ] Database migrations completed
- [ ] Slack webhooks configured and verified
- [ ] Test message sent from widget → appears in Slack
- [ ] Test AI response → appears in widget
- [ ] Test human takeover → agent messages appear in widget
- [ ] Widget embedded and tested on your website

## Monitoring

### Recommended Tools

- **Logs**: Railway/Render/Fly.io built-in logs
- **Uptime**: UptimeRobot or Better Uptime
- **Errors**: Sentry
- **Performance**: New Relic or DataDog

### Key Metrics to Monitor

- API response time
- AI worker job processing time
- Conversation handoff rate
- Redis queue depth
- Database query performance

## Scaling

### When to Scale

- More than 1000 conversations/day
- AI response time > 5 seconds
- Redis queue backing up

### How to Scale

1. **Horizontal Scaling**
   - Add more worker instances
   - Railway/Render auto-scaling available

2. **Optimize**
   - Cache frequent AI prompts
   - Batch database queries
   - Use Redis for session storage

## Troubleshooting

### Slack Webhooks Not Working

```bash
# Test webhook manually
curl -X POST https://your-app.com/slack/events \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test123"}'
```

Should return: `{"challenge":"test123"}`

### AI Not Responding

- Check worker logs
- Verify Gemini API key
- Check Redis connection
- Verify environment variables

### Messages Not in Real-time

- Check SSE connection in browser DevTools
- Verify Redis pub/sub working
- Check CORS headers

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS only in production
- [ ] Slack request signature verification enabled
- [ ] Rate limiting on public endpoints
- [ ] CORS configured properly
- [ ] Database connection over SSL
- [ ] Redis connection over TLS

## Upstash Redis Notes

**Free tier limit**: 500K commands/month

The BullMQ worker polls Redis continuously, using ~10-15K commands/day even when idle.

**If you hit the limit:**
1. Upgrade Upstash (~$10/month for 10M commands), OR
2. Create a new free Upstash instance and update `REDIS_URL` in both Render services

**REDIS_URL format** (must use `rediss://` with double 's' for TLS):
```
rediss://default:YOUR_PASSWORD@your-instance.upstash.io:6379
```

**Update in Render:**
1. claychat-api → Environment → REDIS_URL
2. claychat-bg-worker → Environment → REDIS_URL

## Cost Estimates (per 1000 conversations/month)

| Service | Cost |
|---------|------|
| Railway/Render | $5-10 (starter tier) |
| Supabase | Free tier sufficient |
| Upstash Redis | Free tier or $10/month |
| Gemini API | $0.50-2.00 |
| Slack | Free |
| **Total** | **~$6-23/month** |

## Support

For issues:
1. Check service logs
2. Verify environment variables
3. Test Slack webhook URLs
4. Review database for conversation state

