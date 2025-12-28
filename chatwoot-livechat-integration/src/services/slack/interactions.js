import db from '../../db/queries.js';
import slackService from './client.js';
import realtimeService from '../realtime.js';

export async function handleSlackInteraction(req, res) {
  try {
    res.status(200).send();

    if (!req.body.payload) {
      console.error('No payload in interaction request');
      return;
    }

    const payload = JSON.parse(req.body.payload);
    console.log('Slack interaction received:', payload.type);
    
    if (payload.type !== 'block_actions') return;

    const action = payload.actions[0];
    const conversationId = action.value;
    const userId = payload.user.id;
    const userName = payload.user.name;

    console.log(`Action: ${action.action_id}, Conversation: ${conversationId}, User: ${userName}`);

    switch (action.action_id) {
      case 'takeover':
        await handleTakeover(conversationId, userId, userName);
        break;
      case 'close':
        await handleClose(conversationId, userId, userName);
        break;
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
  }
}

async function handleTakeover(conversationId, userId, userName) {
  const conversation = await db.updateConversationMode(conversationId, 'HUMAN_ACTIVE');
  
  await db.createEvent({
    conversation_id: conversationId,
    event_type: 'human_takeover',
    actor: `agent:${userId}`,
    metadata: { agent_name: userName }
  });

  await slackService.postStatusUpdate(conversation, 'takeover', userName);

  realtimeService.sendToConversation(conversationId, {
    type: 'status',
    status: 'human_active',
    agent_name: userName
  });
}

async function handleClose(conversationId, userId, userName) {
  const conversation = await db.updateConversationMode(conversationId, 'CLOSED');
  
  await db.createEvent({
    conversation_id: conversationId,
    event_type: 'closed',
    actor: `agent:${userId}`,
    metadata: { agent_name: userName }
  });

  await slackService.postStatusUpdate(conversation, 'closed', userName);

  realtimeService.sendToConversation(conversationId, {
    type: 'status',
    status: 'closed'
  });
}


