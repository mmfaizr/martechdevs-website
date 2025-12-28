# Slack Event Setup Checklist

## Current Status
- ✅ Bot Token: Working
- ✅ Bot Scopes: All required scopes present
- ✅ ngrok URL: `https://442798f410de.ngrok-free.app`
- ❌ Message Events: NOT WORKING

## Step-by-Step Fix

### 1. Go to Slack Apps
- URL: https://api.slack.com/apps
- Select: "Martechdevs Support AI" (or your app name)

### 2. Event Subscriptions
- Click "Event Subscriptions" in left sidebar
- Should see "Enable Events" toggle: **ON** (green)
- Request URL: `https://442798f410de.ngrok-free.app/slack/events`
  - Must have **green checkmark ✓**
  - If red X or yellow warning → Click "Change" and re-enter URL, click "Retry"

### 3. Subscribe to Bot Events
Scroll down to "Subscribe to bot events" section.

**Current events should be:**
- `message.channels` (Required Scope: channels:history)

**If `message.channels` is NOT there:**
1. Click "Add Bot User Event"
2. Search for "message.channels"
3. Click it to add
4. Continue to step 4

**If it IS there:** Continue to step 4

### 4. Save Changes
- Scroll to bottom
- Click **"Save Changes"** button (green button)
- **WAIT for page to reload**

### 5. CRITICAL: Reinstall App
After clicking Save, you MUST see a yellow banner at the top:

> ⚠️ Your app's OAuth scopes or Event Subscriptions have changed. **Reinstall your app** for changes to take effect.

**If you see this banner:**
1. Click the blue **"reinstall your app"** link in the banner
2. A popup will appear asking to authorize
3. Click **"Allow"** or **"Authorize"**
4. Wait for confirmation

**If you DON'T see the banner:**
- The events were already saved
- BUT you may not have reinstalled last time
- Go to "OAuth & Permissions" → Click "Reinstall App" button

### 6. Verify Installation
After reinstall:
1. Go back to "Event Subscriptions"
2. Confirm:
   - Request URL has green checkmark ✓
   - `message.channels` is listed under bot events
3. Go to your Slack workspace
4. Verify bot is in `#martechdevs-support` channel

### 7. Test
1. In Slack `#martechdevs-support`:
   - Find any conversation thread
   - Reply to the thread (not main channel)
   - Type: "test message from agent"

2. Check your terminal monitoring logs
   - Should see: `[Slack Event] Received event type: message`
   - Should see: `[Slack Event] Message saved, broadcasting to widget`

3. Check widget
   - Message should appear with agent name

## Troubleshooting

### No events coming through?
1. **Check ngrok:** 
   ```bash
   curl http://localhost:4040/api/requests/http | jq '.requests[-5:]'
   ```
   Should see recent POST requests to /slack/events

2. **Test webhook directly:**
   ```bash
   curl -X POST https://442798f410de.ngrok-free.app/slack/events \
     -H "Content-Type: application/json" \
     -d '{"type":"url_verification","challenge":"test","token":"test"}'
   ```
   Should return: `{"challenge":"test"}`

3. **Check Slack Event Delivery:**
   - In Slack App settings
   - Event Subscriptions → Scroll to bottom
   - Click "View Request Logs"
   - Should see recent attempts with responses

### Events coming but not showing in widget?
- Check conversation mode in database
- Check SSE connection in browser DevTools
- Check for errors in API server logs

### Bot not in channel?
```bash
# In Slack channel, type:
/invite @support_bot
```

## Quick Commands

Start monitoring:
```bash
tail -f /tmp/api-server.log | grep '\[Slack Event\]'
```

Check ngrok URL:
```bash
curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'
```

Test webhook:
```bash
curl -X POST https://442798f410de.ngrok-free.app/slack/events \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test123","token":"test"}'
```

