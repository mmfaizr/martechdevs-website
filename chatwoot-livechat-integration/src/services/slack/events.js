import crypto from 'crypto';
import db from '../../db/queries.js';
import realtimeService from '../realtime.js';
import slackService from './client.js';
import config from '../../config/index.js';

export async function handleSlackEvent(req, res) {
  const payload = req.body;

  if (payload.type === 'url_verification') {
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
}

async function processEvent(event) {
  if (event.type !== 'message') return;
  if (!event.thread_ts) return;
  if (event.bot_id) return;
  if (event.subtype) return;

  const conversation = await db.getConversationByThread(
    event.channel,
    event.thread_ts
  );

  if (!conversation) {
    console.log('No conversation found for thread:', event.thread_ts);
    return;
  }

  if (conversation.mode !== 'HUMAN_ACTIVE') {
    console.log('Ignoring message - mode is:', conversation.mode);
    return;
  }

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


