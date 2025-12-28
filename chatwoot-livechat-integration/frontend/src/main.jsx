import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './components/ChatWidget';
import './styles/widget.css';

class MartechChat {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || '',
      customerInfo: config.customerInfo || {},
      theme: config.theme || 'light',
      autoOpen: config.autoOpen !== undefined ? config.autoOpen : true,
      autoOpenDelay: config.autoOpenDelay || 3000,
      containerId: config.containerId || 'martech-chat-root',
      position: config.position || 'center',
      calLink: config.calLink || 'https://cal.com/faizur-rahman-vvsm0e/15min'
    };
    this.root = null;
    this.container = null;
  }

  init() {
    this.container = document.getElementById(this.config.containerId);
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = this.config.containerId;
      document.body.appendChild(this.container);
    }

    this.root = createRoot(this.container);
    this.render();
  }

  render() {
    this.root.render(
      <ChatWidget
        apiUrl={this.config.apiUrl}
        customerInfo={this.config.customerInfo}
        theme={this.config.theme}
        autoOpen={this.config.autoOpen}
        autoOpenDelay={this.config.autoOpenDelay}
        calLink={this.config.calLink}
      />
    );
  }

  updateCustomerInfo(info) {
    this.config.customerInfo = { ...this.config.customerInfo, ...info };
    this.render();
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
      this.container?.remove();
      this.root = null;
      this.container = null;
    }
  }
}

window.MartechChat = MartechChat;

window.initMartechChat = function(config) {
  const chat = new MartechChat(config);
  chat.init();
  return chat;
};

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.initMartechChat({
    apiUrl: 'http://localhost:3000/api',
    customerInfo: {
      customer_id: 'demo_user_' + Date.now(),
      customer_name: 'Demo User',
      customer_email: 'demo@example.com'
    },
    autoOpen: true,
    autoOpenDelay: 2000
  });
}

export default MartechChat;
