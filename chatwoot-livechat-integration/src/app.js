import express from 'express';
import dotenv from 'dotenv';
import { rawBodyMiddleware } from './middleware/raw-body.js';
import conversationsRouter from './routes/conversations.js';
import slackEventsRouter from './routes/slack-events.js';
import slackInteractionsRouter from './routes/slack-interactions.js';
import config from './config/index.js';

dotenv.config();

const app = express();

app.use(rawBodyMiddleware);
app.use((req, res, next) => {
  if (req.path.startsWith('/slack/')) {
    return next();
  }
  express.json()(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/slack/')) {
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', conversationsRouter);
app.use('/', slackEventsRouter);
app.use('/', slackInteractionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   AI-Powered Chat System with Slack Integration       ║
╚═══════════════════════════════════════════════════════╝

Server running on port ${PORT}
Environment: ${config.server.nodeEnv}

Endpoints:
  GET  /health
  POST /api/conversations
  GET  /api/conversations/:id
  POST /api/conversations/:id/messages
  GET  /api/conversations/:id/stream
  POST /slack/events
  POST /slack/interactions

Remember to:
  1. Run database migrations: npm run migrate
  2. Start the AI worker: npm run worker
  3. Configure Slack app webhooks to point to this server
  `);
});

export default app;


