import express from 'express';
import db from '../db/queries.js';
import slackService from '../services/slack/client.js';
import orchestrator from '../services/orchestrator.js';
import realtimeService from '../services/realtime.js';

const router = express.Router();

router.post('/conversations', async (req, res) => {
  try {
    const { customer_id, customer_name, customer_email, customer_metadata } = req.body;

    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }

    const existingConversation = await db.getConversationByCustomer(customer_id);
    
    if (existingConversation) {
      const messages = await db.getMessages(existingConversation.id);
      return res.json({
        ...existingConversation,
        messages
      });
    }

    const conversation = await db.createConversation({
      customer_id,
      customer_name,
      customer_email,
      customer_metadata
    });

    const { channelId, threadTs } = await slackService.createConversationThread(conversation);
    
    await db.updateConversation(conversation.id, {
      slack_channel_id: channelId,
      slack_thread_ts: threadTs
    });

    await db.createEvent({
      conversation_id: conversation.id,
      event_type: 'created',
      actor: 'customer',
      metadata: { customer_id }
    });

    const updatedConversation = await db.getConversation(conversation.id);

    res.status(201).json({
      ...updatedConversation,
      messages: []
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversation = await db.getConversation(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await db.getMessages(id);

    res.json({
      ...conversation,
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await db.getConversation(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.mode === 'CLOSED') {
      return res.status(400).json({ error: 'Conversation is closed' });
    }

    const message = await db.createMessage({
      conversation_id: id,
      content: content.trim(),
      sender_type: 'customer',
      source: 'widget'
    });

    await orchestrator.onCustomerMessage(id, message.id);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/conversations/:id/stream', async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversation = await db.getConversation(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    realtimeService.addConnection(id, res);

    req.on('close', () => {
      console.log(`SSE connection closed for conversation ${id}`);
    });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


