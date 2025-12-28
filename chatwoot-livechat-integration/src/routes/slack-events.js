import express from 'express';
import { handleSlackEvent } from '../services/slack/events.js';

const router = express.Router();

router.post('/slack/events', (req, res, next) => {
  console.log('[SLACK] Incoming request to /slack/events');
  console.log('[SLACK] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[SLACK] Body:', JSON.stringify(req.body, null, 2));
  next();
}, handleSlackEvent);

export default router;


