import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './components/ChatWidget';
import './styles/widget.css';

window.initChatWidget = function(config) {
  const container = document.getElementById(config.containerId || 'chat-widget-root');
  
  if (!container) {
    console.error('Chat widget container not found');
    return;
  }

  const root = createRoot(container);
  
  root.render(
    <ChatWidget
      apiUrl={config.apiUrl || 'http://localhost:3000/api'}
      customerInfo={config.customerInfo || {}}
      theme={config.theme || 'light'}
    />
  );
};

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.initChatWidget({
    containerId: 'chat-widget-root',
    apiUrl: 'http://localhost:3000/api',
    customerInfo: {
      customer_id: 'demo_user_' + Date.now(),
      customer_name: 'Demo User',
      customer_email: 'demo@example.com'
    }
  });
}


