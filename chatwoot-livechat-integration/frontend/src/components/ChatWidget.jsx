import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useQuoteFlow } from '../hooks/useQuoteFlow';

export default function ChatWidget({ apiUrl, customerInfo, theme = 'light', autoOpen = true, autoOpenDelay = 3000 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [input, setInput] = useState('');
  const [quoteMessages, setQuoteMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const {
    messages,
    status,
    agentName,
    isConnected,
    sendMessage,
    isLoading
  } = useChat(apiUrl, customerInfo);

  const handleQuoteComplete = (answers, quote, quoteMessage) => {
    setQuoteMessages(prev => [
      ...prev,
      { id: `quote_${Date.now()}`, type: 'quote_result', content: quoteMessage, created_at: new Date().toISOString() }
    ]);
  };

  const quoteFlow = useQuoteFlow(apiUrl, handleQuoteComplete);

  useEffect(() => {
    if (autoOpen && !isOpen && !hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
      }, autoOpenDelay);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, isOpen, hasAutoOpened, autoOpenDelay]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, quoteMessages, isOpen, quoteFlow.isActive, quoteFlow.currentStep]);

  useEffect(() => {
    if (isOpen && !quoteFlow.isActive) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen, quoteFlow.isActive]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (quoteFlow.isActive && quoteFlow.currentStep?.inputType) {
      const inputValue = input;
      setInput('');
      setQuoteMessages(prev => [
        ...prev,
        { id: `user_${Date.now()}`, type: 'user_input', content: inputValue, created_at: new Date().toISOString() }
      ]);
      const result = await quoteFlow.submitTextInput(inputValue);
      if (result?.completed) {
        setQuoteMessages(prev => [
          ...prev,
          { id: `quote_${Date.now()}`, type: 'quote_result', content: result.quoteMessage, created_at: new Date().toISOString() }
        ]);
      }
      return;
    }

    if (!isConnected) return;
    
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('quote') || lowerInput.includes('pricing') || lowerInput.includes('cost') || lowerInput.includes('price')) {
      setQuoteMessages([]);
      quoteFlow.startFlow();
      sendMessage(input);
      setInput('');
      return;
    }
    
    sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOptionSelect = (value) => {
    quoteFlow.selectOption(value);
  };

  const handleConfirmSelection = async () => {
    const result = await quoteFlow.confirmSelection();
    if (result) {
      setQuoteMessages(prev => [
        ...prev,
        { id: `user_${Date.now()}`, type: 'user_selection', content: result.selectedLabels, created_at: new Date().toISOString() }
      ]);
      if (result.completed) {
        setQuoteMessages(prev => [
          ...prev,
          { id: `quote_${Date.now()}`, type: 'quote_result', content: result.quoteMessage, created_at: new Date().toISOString() }
        ]);
      }
    }
  };

  const handleStartQuote = () => {
    setQuoteMessages([]);
    quoteFlow.startFlow();
  };

  const allMessages = [...messages];

  return (
    <div className={`chat-widget ${theme}`}>
      {!isOpen && (
        <Launcher onOpen={() => setIsOpen(true)} />
      )}

      {isOpen && (
        <div className="chat-window" role="dialog" aria-label="Chat">
          <div className="chat-header">
            <div className="header-content">
              <h3>Support</h3>
              <StatusBadge status={quoteFlow.isActive ? 'quote' : status} agentName={agentName} />
            </div>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {!isConnected && status !== 'closed' && !quoteFlow.isActive && (
            <ConnectionOverlay status={status} />
          )}

          <div className="messages-container">
            {allMessages.length === 0 && !quoteFlow.isActive && (
              <div className="message ai welcome">
                <div className="message-header">AI Assistant</div>
                <div className="message-content">
                  Hi — want help with anything on this page?
                </div>
                <QuickActions onStartQuote={handleStartQuote} />
                <div className="message-time">Just now</div>
              </div>
            )}
            
            {allMessages.map(msg => (
              <Message key={msg.id} message={msg} />
            ))}

            {quoteFlow.isActive && (
              <>
                <QuoteProgress progress={quoteFlow.progress} />
                
                {quoteMessages.map(msg => (
                  <QuoteMessage key={msg.id} message={msg} />
                ))}

                {quoteFlow.isLoadingQuestion ? (
                  <div className="message ai">
                    <div className="message-header">AI Assistant</div>
                    <div className="message-content">
                      <TypingIndicator />
                    </div>
                  </div>
                ) : quoteFlow.currentStep && (
                  <QuoteStep
                    step={quoteFlow.currentStep}
                    selectedOptions={quoteFlow.selectedOptions}
                    onSelect={handleOptionSelect}
                    onConfirm={handleConfirmSelection}
                    onBack={quoteFlow.canGoBack ? quoteFlow.goBack : null}
                    onCancel={quoteFlow.cancelFlow}
                  />
                )}
              </>
            )}

            {!quoteFlow.isActive && quoteMessages.length > 0 && (
              quoteMessages.filter(m => m.type === 'quote_result').map(msg => (
                <QuoteMessage key={msg.id} message={msg} />
              ))
            )}
            
            {isLoading && !quoteFlow.isActive && (
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
              {quoteFlow.isActive && quoteFlow.currentStep?.inputType ? (
                <>
                  <input
                    ref={inputRef}
                    type={quoteFlow.currentStep.inputType}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Enter your ${quoteFlow.currentStep.inputType}...`}
                    className="quote-input"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="send-button"
                  >
                    <SendIcon />
                  </button>
                </>
              ) : quoteFlow.isActive ? (
                <div className="quote-input-hint">
                  Select options above or type to filter
                </div>
              ) : (
                <>
                  <textarea
                    ref={inputRef}
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
                </>
              )}
            </div>
          ) : (
            <div className="closed-banner">
              This conversation has been closed.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickActions({ onStartQuote }) {
  return (
    <div className="quick-actions">
      <button className="quick-action-btn quote-btn" onClick={onStartQuote}>
        <span className="quick-action-icon">💰</span>
        Get Instant Quote
      </button>
    </div>
  );
}

function QuoteProgress({ progress }) {
  return (
    <div className="quote-progress">
      <div className="quote-progress-bar">
        <div 
          className="quote-progress-fill" 
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <span className="quote-progress-text">
        Step {progress.current} of {progress.total}
      </span>
    </div>
  );
}

function QuoteStep({ step, selectedOptions, onSelect, onConfirm, onBack, onCancel }) {
  return (
    <div className="quote-step">
      <div className="message ai">
        <div className="message-header">AI Assistant</div>
        <div className="message-content">{step.question}</div>
      </div>

      {step.options.length > 0 && (
        <div className="quote-options">
          {step.options.map(option => (
            <button
              key={option.value}
              className={`quote-option ${selectedOptions.includes(option.value) ? 'selected' : ''}`}
              onClick={() => onSelect(option.value)}
            >
              <span className="option-icon">{option.icon}</span>
              <span className="option-label">{option.label}</span>
              {selectedOptions.includes(option.value) && (
                <span className="option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="quote-actions">
        {onBack && (
          <button className="quote-nav-btn back" onClick={onBack}>
            ← Back
          </button>
        )}
        <button className="quote-nav-btn cancel" onClick={onCancel}>
          Cancel
        </button>
        {step.options.length > 0 && (
          <button 
            className="quote-nav-btn confirm" 
            onClick={onConfirm}
            disabled={selectedOptions.length === 0}
          >
            {step.multiSelect ? `Continue (${selectedOptions.length})` : 'Continue'} →
          </button>
        )}
      </div>
    </div>
  );
}

function QuoteMessage({ message }) {
  if (message.type === 'quote_result') {
    return (
      <div className="message ai quote-result">
        <div className="message-header">AI Assistant</div>
        <div className="message-content quote-content">
          {message.content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line.startsWith('**') && line.endsWith('**') ? (
                <strong>{line.replace(/\*\*/g, '')}</strong>
              ) : line.startsWith('•') ? (
                <div className="quote-line-item">{line}</div>
              ) : (
                line
              )}
              {i < message.content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <div className="message-time">{formatTime(message.created_at)}</div>
      </div>
    );
  }

  return (
    <div className="message customer">
      <div className="message-header">You</div>
      <div className="message-content">{message.content}</div>
      <div className="message-time">{formatTime(message.created_at)}</div>
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
        {isAI && 'AI Assistant'}
        {isHuman && `${message.agent_name || 'Agent'}`}
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
    'closed': { text: 'Closed', color: 'gray' },
    'quote': { text: 'Quote Builder', color: 'purple' }
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

function Launcher({ onOpen }) {
  return (
    <div className="chat-launcher-wrap">
      <button className="chat-launcher" onClick={onOpen} aria-label="Open chat">
        <div className="launcher-stage">
          <div className="launcher-aurora-ring" />
          <div className="launcher-void" />
          <div className="launcher-portal-back" />
          <div className="launcher-particles">
            <span className="p p1" />
            <span className="p p2" />
            <span className="p p3" />
            <span className="p p4" />
            <span className="p p5" />
            <span className="p p6" />
            <span className="p p7" />
            <span className="p p8" />
          </div>
          <div className="launcher-orb">
            <div className="orb-body">
              <div className="orb-face">
                <div className="orb-visor" />
                <div className="orb-eye left" />
                <div className="orb-eye right" />
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function ConnectionOverlay({ status }) {
  const title = status === 'handoff_pending' ? 'Connecting you to an agent' : 'Connecting';
  const subtitle = status === 'handoff_pending' ? 'Please wait a moment…' : 'Establishing secure link…';

  return (
    <div className="chat-connecting-overlay" aria-live="polite" aria-atomic="true">
      <div className="connecting-stage">
        <div className="connecting-aurora-ring" />
        <div className="connecting-void" />
        <div className="connecting-portal" />
        <div className="connecting-particles">
          <span className="p p1" />
          <span className="p p2" />
          <span className="p p3" />
          <span className="p p4" />
          <span className="p p5" />
          <span className="p p6" />
          <span className="p p7" />
          <span className="p p8" />
        </div>
        <div className="connecting-orb">
          <div className="connecting-orb-body">
            <div className="connecting-orb-face">
              <div className="connecting-orb-visor" />
              <div className="connecting-orb-eye left" />
              <div className="connecting-orb-eye right" />
            </div>
          </div>
        </div>
      </div>
      <div className="connecting-text">
        {title}
        <div className="connecting-subtitle">{subtitle}</div>
      </div>
    </div>
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
