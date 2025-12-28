# Deployment Guide

## Repository Structure
```
Martechdevs Website/
├── chatwoot-livechat-integration/  → Backend (Render: claychat)
├── martechdevs-web/                → Frontend (Vercel)
```

---

## 1. Backend (ClayChat) - Render

**GitHub Repo:** `github.com/mmfaizr/claychat`  
**Render Services:** `claychat` (web) + `claychat-bg-worker` (background)

### Push & Deploy
```bash
cd chatwoot-livechat-integration
git add -A
git commit -m "your commit message"
git push claychat main
```

### If claychat remote not set:
```bash
git remote add claychat git@github.com:mmfaizr/claychat.git
```

### Manual Deploy (if needed)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select `claychat` service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## 2. Frontend (MartechDevs Web) - Vercel

**GitHub Repo:** `github.com/mmfaizr/martechdevs-website`  
**Auto-deploys** on push to `main`

### Push & Deploy
```bash
cd martechdevs-web
git add -A
git commit -m "your commit message"
git push origin main
```

Or from root:
```bash
git add -A
git commit -m "your commit message"
git push origin main
```

---

## 3. Chat Widget Updates

When updating the chat widget, rebuild and copy to martechdevs-web:

```bash
cd chatwoot-livechat-integration/frontend
npm run build
cp dist/martech-chat.* ../../martechdevs-web/public/chat/
```

Then commit and push martechdevs-web to deploy widget changes.

---

## 4. Environment Variables

### Render (claychat)
```
DATABASE_URL=postgresql://...@aws-0-...supabase.co:5432/postgres
REDIS_URL=rediss://default:...@...-redis.upstash.io:6379
GEMINI_API_KEY=...
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...
NODE_ENV=production
```

### Vercel (martechdevs-web)
```
NEXT_PUBLIC_CHAT_API_URL=https://claychat.onrender.com/api
```

---

## 5. Quick Commands

### Full deployment (backend + frontend):
```bash
# From workspace root
cd chatwoot-livechat-integration
git add -A && git commit -m "update" && git push claychat main

cd ../martechdevs-web
git add -A && git commit -m "update" && git push origin main
```

### Rebuild chat widget only:
```bash
cd chatwoot-livechat-integration/frontend
npm run build
cp dist/martech-chat.* ../../martechdevs-web/public/chat/
cd ../../martechdevs-web
git add -A && git commit -m "rebuild widget" && git push origin main
```

---

## 6. Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard
- **Upstash:** https://console.upstash.com
- **Cal.com:** https://cal.com/faizur-rahman-vvsm0e/15min

