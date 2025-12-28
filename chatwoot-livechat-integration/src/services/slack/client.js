import { WebClient } from '@slack/web-api';
import config from '../../config/index.js';

class SlackService {
  constructor() {
    this.client = new WebClient(config.slack.botToken);
    this.channelId = config.slack.supportChannelId;
  }

  async createConversationThread(conversation) {
    const result = await this.client.chat.postMessage({
      channel: this.channelId,
      text: `💬 New conversation from *${conversation.customer_name || 'Unknown'}*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `💬 *New Conversation*\n` +
                  `*Customer:* ${conversation.customer_name || 'Unknown'}\n` +
                  `*Email:* ${conversation.customer_email || 'N/A'}\n` +
                  `*ID:* \`${conversation.id}\``
          }
        }
      ]
    });

    return {
      channelId: result.channel,
      threadTs: result.ts
    };
  }

  async mirrorMessage(conversation, message) {
    const prefix = {
      'customer': '👤 *Customer:*',
      'ai': '🤖 *AI:*',
      'human': '👩‍💼 *Agent:*'
    }[message.sender_type];

    const result = await this.client.chat.postMessage({
      channel: conversation.slack_channel_id,
      thread_ts: conversation.slack_thread_ts,
      text: `${prefix} ${message.content}`,
      unfurl_links: false
    });

    return result.ts;
  }

  async postHandoffRequest(conversation, reason) {
    await this.client.chat.postMessage({
      channel: conversation.slack_channel_id,
      thread_ts: conversation.slack_thread_ts,
      text: '🚨 Handoff requested',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🚨 *Handoff Requested*\n${reason || 'AI needs human assistance.'}`
          }
        },
        {
          type: 'actions',
          block_id: 'handoff_actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '✋ Take Over', emoji: true },
              style: 'primary',
              action_id: 'takeover',
              value: conversation.id
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '✓ Close', emoji: true },
              action_id: 'close',
              value: conversation.id
            }
          ]
        }
      ]
    });
  }

  async postStatusUpdate(conversation, status, agentName = null) {
    const messages = {
      'takeover': `✅ *${agentName || 'An agent'}* has taken over this conversation.`,
      'closed': `🔒 Conversation closed by *${agentName || 'agent'}*.`,
      'ai_resumed': '🤖 AI has resumed handling this conversation.'
    };

    await this.client.chat.postMessage({
      channel: conversation.slack_channel_id,
      thread_ts: conversation.slack_thread_ts,
      text: messages[status] || status
    });
  }

  async getUserInfo(userId) {
    try {
      const result = await this.client.users.info({ user: userId });
      return result.user;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }
}

export default new SlackService();




