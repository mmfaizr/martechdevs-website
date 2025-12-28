import crypto from 'crypto';
import db from '../../db/queries.js';
import realtimeService from '../realtime.js';
import slackService from './client.js';
import config from '../../config/index.js';

export async function handleSlackEvent(req, res) {
  try {
    const payload = req.body;

    if (payload.type === 'url_verification') {
      console.log('Slack URL verification received');
      return res.json({ challenge: payload.challenge });
    }

    if (!verifySlackRequest(req, config.slack.signingSecret)) {
      console.error('Invalid Slack signature');
      return res.status(401).send('Invalid signature');
    }

    res.status(200).send();

    if (payload.type === 'event_callback') {
      processEvent(payload.event).catch(error => {
        console.error('Error processing Slack event:', error);
      });
    }
  } catch (error) {
    console.error('Error in handleSlackEvent:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function processEvent(event) {
  console.log('[Slack Event] Received event type:', event.type);
  
  if (event.type !== 'message') {
    console.log('[Slack Event] Ignoring non-message event');
    return;
  }
  
  console.log('[Slack Event] Message details:', {
    thread_ts: event.thread_ts,
    bot_id: event.bot_id,
    subtype: event.subtype,
    text: event.text?.substring(0, 50)
  });
  
  if (!event.thread_ts) {
    console.log('[Slack Event] Ignoring - no thread_ts');
    return;
  }
  if (event.bot_id) {
    console.log('[Slack Event] Ignoring - bot message');
    return;
  }
  if (event.subtype) {
    console.log('[Slack Event] Ignoring - has subtype:', event.subtype);
    return;
  }

  const conversation = await db.getConversationByThread(
    event.channel,
    event.thread_ts
  );

  if (!conversation) {
    console.log('[Slack Event] No conversation found for thread:', event.thread_ts);
    return;
  }

  console.log('[Slack Event] Conversation found:', conversation.id, 'Mode:', conversation.mode);

  // TEMPORARY: Allow messages in any mode for testing
  // if (conversation.mode !== 'HUMAN_ACTIVE') {
  //   console.log('[Slack Event] Ignoring message - mode is:', conversation.mode, '(needs HUMAN_ACTIVE)');
  //   return;
  // }
  
  console.log('[Slack Event] Processing message (mode check disabled for testing)');

  const eventId = `slack_${event.channel}_${event.ts}_${event.event_ts}`;
  const exists = await db.messageExistsBySlackEvent(eventId);
  if (exists) {
    console.log('Duplicate event, skipping:', eventId);
    return;
  }

  const user = await slackService.getUserInfo(event.user);
  const agentName = user?.real_name || user?.name || 'Agent';

  const message = await db.createMessage({
    conversation_id: conversation.id,
    content: event.text,
    sender_type: 'human',
    source: 'slack',
    slack_message_ts: event.ts,
    slack_event_id: eventId,
    metadata: { 
      slack_user_id: event.user,
      agent_name: agentName
    }
  });

  console.log('[Slack Event] Message saved, broadcasting to widget. Message ID:', message.id);

  realtimeService.sendToConversation(conversation.id, {
    type: 'message',
    message: {
      id: message.id,
      content: message.content,
      sender_type: 'human',
      agent_name: agentName,
      created_at: message.created_at
    }
  });
  
  console.log('[Slack Event] ✓ Agent message processed successfully');
}

function verifySlackRequest(req, signingSecret) {
  const timestamp = req.headers['x-slack-request-timestamp'];
  const signature = req.headers['x-slack-signature'];
  
  if (!timestamp || !signature) return false;
  
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
  if (parseInt(timestamp) < fiveMinutesAgo) return false;
  
  const sigBasestring = `v0:${timestamp}:${req.rawBody}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring, 'utf8')
    .digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch {
    return false;
  }
}


