#!/bin/bash

echo "🚀 Starting Local Development Environment"
echo "════════════════════════════════════════"

# Check if services are already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use. Stopping existing services..."
    pkill -f "node.*app.js" 2>/dev/null
    pkill -f "node.*ai-responder.js" 2>/dev/null
    sleep 2
fi

# Start API Server
echo "1️⃣ Starting API Server..."
node src/app.js > /tmp/api-server.log 2>&1 &
API_PID=$!
echo "   ✓ API Server started (PID: $API_PID)"

# Start AI Worker
echo "2️⃣ Starting AI Worker..."
node src/workers/ai-responder.js > /tmp/ai-worker.log 2>&1 &
WORKER_PID=$!
echo "   ✓ AI Worker started (PID: $WORKER_PID)"

# Wait for services to be ready
echo "3️⃣ Waiting for services to initialize..."
sleep 3

# Check if services are running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "   ✓ Services are healthy"
else
    echo "   ✗ Services failed to start. Check logs:"
    echo "     tail -f /tmp/api-server.log"
    echo "     tail -f /tmp/ai-worker.log"
    exit 1
fi

# Start ngrok
echo "4️⃣ Starting ngrok tunnel..."
ngrok http 3000 > /dev/null &
NGROK_PID=$!
sleep 2

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "   ✗ Failed to get ngrok URL"
    echo "   Starting ngrok web interface..."
    open http://localhost:4040
    exit 1
fi

echo "   ✓ ngrok tunnel established"
echo ""
echo "════════════════════════════════════════"
echo "✅ All services started successfully!"
echo "════════════════════════════════════════"
echo ""
echo "📍 Service URLs:"
echo "   API Server:  http://localhost:3000"
echo "   Widget Demo: http://localhost:5173"
echo "   Public URL:  $NGROK_URL"
echo "   ngrok Web:   http://localhost:4040"
echo ""
echo "📝 Slack Configuration:"
echo "   Event Subscriptions URL:"
echo "   → $NGROK_URL/slack/events"
echo ""
echo "   Interactivity URL:"
echo "   → $NGROK_URL/slack/interactions"
echo ""
echo "🔧 Next Steps:"
echo "   1. Go to: https://api.slack.com/apps"
echo "   2. Select your app"
echo "   3. Configure Event Subscriptions → Request URL:"
echo "      $NGROK_URL/slack/events"
echo "   4. Configure Interactivity → Request URL:"
echo "      $NGROK_URL/slack/interactions"
echo "   5. Save changes"
echo ""
echo "📊 Logs:"
echo "   API:    tail -f /tmp/api-server.log"
echo "   Worker: tail -f /tmp/ai-worker.log"
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f 'node.*app.js' && pkill -f 'node.*ai-responder.js' && pkill ngrok"
echo ""
echo "Press Ctrl+C to stop ngrok (services will continue running)"
echo "════════════════════════════════════════"

# Keep script running and show ngrok status
trap "echo ''; echo '⚠️  ngrok stopped. Services are still running.'; exit 0" INT TERM

# Follow ngrok process
wait $NGROK_PID

