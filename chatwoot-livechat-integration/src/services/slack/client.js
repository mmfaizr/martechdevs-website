import { WebClient } from '@slack/web-api';
import config from '../../config/index.js';

class SlackService {
  constructor() {
    this.client = new WebClient(config.slack.botToken);
    this.channelId = config.slack.supportChannelId;
  }

  async createConversationThread(conversation) {
    const meta = conversation.customer_metadata || {};
    
    const location = [meta.city, meta.country].filter(Boolean).join(', ');
    const deviceInfo = [meta.os, meta.browser].filter(Boolean).join(' / ');
    const resolution = meta.screen_width && meta.screen_height ? `${meta.screen_width}x${meta.screen_height}` : null;
    const page = meta.current_page || '/';
    const referrer = meta.referrer && meta.referrer !== 'direct' ? meta.referrer.replace(/^https?:\/\//, '').split('/')[0] : null;
    
    const line1 = [location, deviceInfo].filter(Boolean).join(' • ') || 'New visitor';
    const line2 = [resolution, referrer ? `from ${referrer}` : null].filter(Boolean).join(' • ');

    const result = await this.client.chat.postMessage({
      channel: this.channelId,
      text: `New conversation: ${line1}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*New Conversation*\n${line1}${line2 ? `\n${line2}` : ''}\n${page}`
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

  async postQuoteSummary(conversation, email, quoteSummary) {
    await this.client.chat.postMessage({
      channel: conversation.slack_channel_id,
      thread_ts: conversation.slack_thread_ts,
      text: '📋 Quote Generated',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📋 Quote Generated',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Customer Email:* ${email || 'Not provided'}\n\n${quoteSummary.replace(/\*\*/g, '*')}`
          }
        },
        {
          type: 'actions',
          block_id: 'quote_actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '📧 Send Proposal', emoji: true },
              style: 'primary',
              action_id: 'send_proposal',
              value: JSON.stringify({ conversationId: conversation.id, email })
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '📞 Schedule Call', emoji: true },
              action_id: 'schedule_call',
              value: conversation.id
            }
          ]
        }
      ]
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




