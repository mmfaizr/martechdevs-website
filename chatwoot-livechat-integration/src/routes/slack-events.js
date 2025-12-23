import express from 'express';
import { handleSlackEvent } from '../services/slack/events.js';

const router = express.Router();

router.post('/slack/events', handleSlackEvent);

export default router;


