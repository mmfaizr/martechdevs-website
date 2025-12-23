import express from 'express';
import { handleSlackInteraction } from '../services/slack/interactions.js';

const router = express.Router();

router.post('/slack/interactions', handleSlackInteraction);

export default router;


