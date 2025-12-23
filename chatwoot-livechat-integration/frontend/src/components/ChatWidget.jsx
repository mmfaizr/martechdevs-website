import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

export default function ChatWidget({ apiUrl, customerInfo, theme = 'light' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const {
    messages,
    status,
    agentName,
    isConnected,
    sendMessage,
    isLoading
  } = useChat(apiUrl, customerInfo);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-widget ${theme}`}>
      {!isOpen && (
        <button
          className="chat-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <ChatIcon />
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-content">
              <h3>Support</h3>
              <StatusBadge status={status} agentName={agentName} />
            </div>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Hi! How can we help you today?</p>
              </div>
            )}
            
            {messages.map(msg => (
              <Message key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="message ai">
                <div className="message-content">
                  <TypingIndicator />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {status !== 'closed' ? (
            <div className="input-area">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={!isConnected}
                rows="1"
              />
              <button
                onClick={handleSend}
                disabled={!isConnected || !input.trim()}
                className="send-button"
              >
                <SendIcon />
              </button>
            </div>
          ) : (
            <div className="closed-banner">
              This conversation has been closed.
            </div>
          )}

          {!isConnected && status !== 'closed' && (
            <div className="connection-status">
              Reconnecting...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Message({ message }) {
  const isCustomer = message.sender_type === 'customer';
  const isAI = message.sender_type === 'ai';
  const isHuman = message.sender_type === 'human';
  
  return (
    <div className={`message ${message.sender_type}`}>
      <div className="message-header">
        {isCustomer && 'You'}
        {isAI && '🤖 AI Assistant'}
        {isHuman && `👩‍💼 ${message.agent_name || 'Agent'}`}
      </div>
      <div className="message-content">
        {message.content}
      </div>
      <div className="message-time">
        {formatTime(message.created_at)}
      </div>
    </div>
  );
}

function StatusBadge({ status, agentName }) {
  const statusConfig = {
    'ai_active': { text: 'AI Assistant', color: 'blue' },
    'handoff_pending': { text: 'Connecting...', color: 'yellow' },
    'human_active': { text: agentName || 'Agent', color: 'green' },
    'closed': { text: 'Closed', color: 'gray' }
  };

  const config = statusConfig[status] || statusConfig['ai_active'];

  return (
    <span className={`status-badge ${config.color}`}>
      {config.text}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 11.5C21 16.75 16.75 21 11.5 21C10.39 21 9.32999 20.83 8.35999 20.52L3 22L4.48 16.64C4.17 15.67 4 14.61 4 13.5C4 8.25 8.25 4 13.5 4C18.75 4 23 8.25 23 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


