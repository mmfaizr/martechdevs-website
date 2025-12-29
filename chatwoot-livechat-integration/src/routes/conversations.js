import express from 'express';
import db from '../db/queries.js';
import slackService from '../services/slack/client.js';
import orchestrator from '../services/orchestrator.js';
import realtimeService from '../services/realtime.js';
import geminiService from '../services/gemini.js';
import quoteGenerator from '../services/quoteGenerator.js';

const router = express.Router();

const quoteSessionStore = new Map();

router.post('/greeting', async (req, res) => {
  try {
    const visitorContext = req.body;
    const result = await geminiService.generateGreeting(visitorContext);
    res.json(result);
  } catch (error) {
    console.error('Error generating greeting:', error);
    res.json({ greeting: "Hey - anything I can help you with today?" });
  }
});

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

    try {
      const { channelId, threadTs } = await slackService.createConversationThread(conversation);
      
      await db.updateConversation(conversation.id, {
        slack_channel_id: channelId,
        slack_thread_ts: threadTs
      });
    } catch (slackError) {
      console.warn('Slack integration unavailable, continuing without it:', slackError.message);
    }

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

router.post('/quote/next', async (req, res) => {
  try {
    const { conversation_id, previous_answer, collected_data, previous_field } = req.body;

    console.log('[Quote Flow] Generating step:', { 
      conversation_id, 
      previous_answer: previous_answer?.substring(0, 50), 
      previous_field,
      collected_keys: Object.keys(collected_data || {}) 
    });
    
    const result = await geminiService.generateQuoteStep(
      previous_answer || '', 
      collected_data || {},
      previous_field || null
    );
    
    console.log('[Quote Flow] Result:', { 
      question: result.question?.substring(0, 50), 
      options_count: result.options?.length, 
      is_complete: result.is_complete,
      next_field: result.next_field,
      collected_keys: Object.keys(result.collected_data || {})
    });

    if (conversation_id) {
      try {
        const conversation = await db.getConversation(conversation_id);
        if (conversation) {
          if (previous_answer) {
            const customerMsg = await db.createMessage({
              conversation_id,
              content: previous_answer,
              sender_type: 'customer',
              source: 'quote_flow'
            });
            await slackService.mirrorMessage(conversation, customerMsg).catch(() => {});
          }

          if (result.question && !result.is_complete) {
            const aiMsg = await db.createMessage({
              conversation_id,
              content: result.question,
              sender_type: 'ai',
              source: 'quote_flow'
            });
            await slackService.mirrorMessage(conversation, aiMsg).catch(() => {});
          }
        }
      } catch (dbErr) {
        console.warn('Failed to store quote messages:', dbErr.message);
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error in quote flow:', error);
    res.status(500).json({ error: 'Failed to process quote step' });
  }
});

router.post('/quote/generate', async (req, res) => {
  try {
    const { answers, calculated_quote } = req.body;

    if (!answers || !calculated_quote) {
      return res.status(400).json({ error: 'answers and calculated_quote are required' });
    }

    const salesQuote = await quoteGenerator.generateSalesQuote(answers, calculated_quote);
    
    res.json({ quote_message: salesQuote });
  } catch (error) {
    console.error('Error generating sales quote:', error);
    res.status(500).json({ error: 'Failed to generate quote' });
  }
});

router.post('/quote/complete', async (req, res) => {
  try {
    const { conversation_id, quote_summary, email, answers, calculated_quote } = req.body;

    if (!conversation_id) {
      return res.status(400).json({ error: 'conversation_id is required' });
    }

    const conversation = await db.getConversation(conversation_id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    let finalQuoteSummary = quote_summary;
    
    if (answers && calculated_quote && !quote_summary) {
      finalQuoteSummary = await quoteGenerator.generateSalesQuote(answers, calculated_quote);
    }

    const message = await db.createMessage({
      conversation_id,
      content: finalQuoteSummary,
      sender_type: 'ai',
      source: 'quote_flow'
    });

    try {
      await slackService.mirrorMessage(conversation, message);
      await slackService.postQuoteSummary(conversation, email, finalQuoteSummary);
    } catch (slackErr) {
      console.warn('Slack mirror failed for quote completion:', slackErr.message);
    }

    res.json({ success: true, quote_message: finalQuoteSummary });
  } catch (error) {
    console.error('Error completing quote:', error);
    res.status(500).json({ error: 'Failed to complete quote' });
  }
});

router.post('/quote/start', async (req, res) => {
  try {
    const sessionId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    quoteSessionStore.set(sessionId, {
      history: [],
      collectedData: {},
      startedAt: new Date().toISOString()
    });

    const { text, quoteData } = await geminiService.generateQuoteResponse([], 'I want to get a quote for martech integration services');

    const session = quoteSessionStore.get(sessionId);
    session.history.push(
      { role: 'user', content: 'I want to get a quote' },
      { role: 'assistant', content: text }
    );
    if (quoteData?.collected) {
      session.collectedData = { ...session.collectedData, ...quoteData.collected };
    }

    res.json({
      sessionId,
      message: text,
      collectedData: session.collectedData,
      isComplete: false
    });
  } catch (error) {
    console.error('Error starting quote flow:', error);
    res.status(500).json({ error: 'Failed to start quote flow' });
  }
});

router.post('/quote/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const session = quoteSessionStore.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Quote session not found or expired' });
    }

    const historyForAI = session.history.map(h => ({
      sender_type: h.role === 'user' ? 'customer' : 'ai',
      content: h.content
    }));

    const { text, quoteData, isComplete } = await geminiService.generateQuoteResponse(
      historyForAI,
      content.trim()
    );

    session.history.push(
      { role: 'user', content: content.trim() },
      { role: 'assistant', content: text }
    );
    
    if (quoteData?.collected) {
      session.collectedData = { ...session.collectedData, ...quoteData.collected };
    }

    let quote = null;
    if (isComplete) {
      quote = calculateQuote(session.collectedData);
      quoteSessionStore.delete(sessionId);
    }

    res.json({
      message: text,
      collectedData: session.collectedData,
      isComplete,
      quote
    });
  } catch (error) {
    console.error('Error in quote flow:', error);
    res.status(500).json({ error: 'Failed to process quote message' });
  }
});

router.delete('/quote/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  quoteSessionStore.delete(sessionId);
  res.json({ success: true });
});

function calculateQuote(data) {
  const pricing = {
    base: { early_stage: 3000, growth_stage: 6000, enterprise: 12000 },
    platforms: { website: 500, web_app: 1000, ios: 2000, android: 2000 },
    traffic: { under_5k: 0, '5k_50k': 500, '50k_100k': 1000, '100k_1m': 2000, over_1m: 4000 },
    devModel: { full: 1, copilot: 0.7 },
    urgency: { asap: 1.5, two_weeks: 1.25, month: 1, quarter: 0.9 },
    goalsPerItem: 1500,
    toolsPerItem: 300,
    documentation: { docs: 800, videos: 1500, none: 0 },
    trainingHours: { none: 0, '5': 750, '20': 2500, '50': 5000 },
    supportMonthly: { '5': 500, '20': 1800, '50': 4000, '100': 7500 }
  };

  let total = 0;
  const breakdown = [];

  const stageKey = (data.company_stage || 'growth_stage').toLowerCase().replace(/\s+/g, '_');
  const basePrice = pricing.base[stageKey] || pricing.base.growth_stage;
  total += basePrice;
  breakdown.push({ item: 'Base implementation', amount: basePrice });

  if (data.platforms?.length) {
    const platformCost = data.platforms.reduce((sum, p) => {
      const key = p.toLowerCase().replace(/\s+/g, '_');
      return sum + (pricing.platforms[key] || 500);
    }, 0);
    total += platformCost;
    breakdown.push({ item: `Platforms (${data.platforms.length})`, amount: platformCost });
  }

  if (data.goals?.length) {
    const goalsCost = data.goals.length * pricing.goalsPerItem;
    total += goalsCost;
    breakdown.push({ item: `Goals (${data.goals.length})`, amount: goalsCost });
  }

  if (data.tools?.length) {
    const toolsCost = data.tools.length * pricing.toolsPerItem;
    total += toolsCost;
    breakdown.push({ item: `Tool integrations (${data.tools.length})`, amount: toolsCost });
  }

  if (data.documentation?.length) {
    const docCost = data.documentation.reduce((sum, d) => {
      const key = d.toLowerCase();
      return sum + (pricing.documentation[key] || 0);
    }, 0);
    if (docCost > 0) {
      total += docCost;
      breakdown.push({ item: 'Documentation', amount: docCost });
    }
  }

  const trainingKey = (data.training_hours || 'none').replace(/\s*hours?/i, '');
  const trainingCost = pricing.trainingHours[trainingKey] || 0;
  if (trainingCost > 0) {
    total += trainingCost;
    breakdown.push({ item: 'Training', amount: trainingCost });
  }

  const devMultiplier = pricing.devModel[data.dev_model] || 1;
  total = total * devMultiplier;

  const urgencyKey = (data.urgency || 'month').toLowerCase().replace(/\s+/g, '_');
  const urgencyMultiplier = pricing.urgency[urgencyKey] || 1;
  total = total * urgencyMultiplier;

  let monthlySupport = 0;
  const supportKey = (data.support_hours || '5').replace(/\s*hours?/i, '');
  monthlySupport = pricing.supportMonthly[supportKey] || 500;

  return {
    oneTime: Math.round(total),
    monthly: monthlySupport,
    breakdown,
    email: data.email
  };
}

router.get('/conversations/:id/stream', async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversation = await db.getConversation(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    realtimeService.addConnection(id, res);

    const keepaliveInterval = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (err) {
        clearInterval(keepaliveInterval);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(keepaliveInterval);
      console.log(`SSE connection closed for conversation ${id}`);
    });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


