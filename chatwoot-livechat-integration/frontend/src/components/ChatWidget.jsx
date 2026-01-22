import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useQuoteFlow } from '../hooks/useQuoteFlow';
import { getFullVisitorContext } from '../utils/visitorContext';
import Markdown from './Markdown';
import CalEmbed from './CalEmbed';

export default function ChatWidget({ 
  apiUrl, 
  customerInfo, 
  theme = 'light', 
  autoOpen = true, 
  autoOpenDelay = 3000,
  calLink = 'martechdevs/discovery'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [input, setInput] = useState('');
  const [quoteMessages, setQuoteMessages] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBookCallButton, setShowBookCallButton] = useState(false);
  const [pendingQuoteStart, setPendingQuoteStart] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const [greetingLoading, setGreetingLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const visitorContext = await getFullVisitorContext();
        const res = await fetch(`${apiUrl}/greeting`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visitorContext)
        });
        if (res.ok) {
          const data = await res.json();
          setGreeting(data.greeting);
        }
      } catch (e) {
        console.warn('Failed to fetch greeting:', e.message);
      } finally {
        setGreetingLoading(false);
      }
    };
    fetchGreeting();
  }, [apiUrl]);

  useEffect(() => {
    const handleOpenQuote = () => {
      setIsOpen(true);
      setHasAutoOpened(true);
      setTimeout(() => {
        setQuoteMessages([]);
        if (conversationId) {
          quoteFlow.startFlow();
        } else {
          setPendingQuoteStart(true);
        }
      }, 300);
    };
    
    window.addEventListener('openChatQuote', handleOpenQuote);
    return () => window.removeEventListener('openChatQuote', handleOpenQuote);
  }, [conversationId, quoteFlow]);

  const handleQuoteComplete = (answers, quote, quoteMessage) => {
    const hasBookCallTrigger = quoteMessage.includes('[SHOW_BOOK_CALL_BUTTON]');
    const cleanMessage = quoteMessage.replace('[SHOW_BOOK_CALL_BUTTON]', '').replace('[SHOW_CALENDAR]', '').trim();
    
    setQuoteMessages(prev => [
      ...prev,
      { id: `quote_${Date.now()}`, type: 'quote_result', content: cleanMessage, created_at: new Date().toISOString() }
    ]);
    
    if (hasBookCallTrigger) {
      setShowBookCallButton(true);
    }
  };

  const handleQuoteFlowTrigger = () => {
    setPendingQuoteStart(true);
  };
  
  const {
    conversationId,
    messages,
    status,
    agentName,
    isConnected,
    sendMessage,
    isLoading
  } = useChat(apiUrl, customerInfo, handleQuoteFlowTrigger);

  const quoteFlow = useQuoteFlow(apiUrl, conversationId, handleQuoteComplete);

  useEffect(() => {
    if (pendingQuoteStart && conversationId && !quoteFlow.isActive) {
      setQuoteMessages([]);
      quoteFlow.startFlow();
      setPendingQuoteStart(false);
    }
  }, [pendingQuoteStart, conversationId, quoteFlow]);

  useEffect(() => {
    if (autoOpen && !isOpen && !hasAutoOpened && greeting && !greetingLoading) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
      }, autoOpenDelay);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, isOpen, hasAutoOpened, autoOpenDelay, greeting, greetingLoading]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, quoteMessages, isOpen, quoteFlow.isActive, quoteFlow.currentStep, showCalendar]);

  useEffect(() => {
    if (isOpen && !quoteFlow.isActive && !showCalendar) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen, quoteFlow.isActive, showCalendar]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (quoteFlow.isActive && quoteFlow.currentStep) {
      const inputValue = input;
      const currentQuestion = quoteFlow.currentStep.question;
      setInput('');
      setQuoteMessages(prev => [
        ...prev,
        { id: `q_${Date.now()}`, type: 'ai_question', content: currentQuestion, created_at: new Date().toISOString() },
        { id: `user_${Date.now()}`, type: 'user_input', content: inputValue, created_at: new Date().toISOString() }
      ]);
      await quoteFlow.submitTextInput(inputValue);
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
    
    if (lowerInput.includes('call') || lowerInput.includes('schedule') || lowerInput.includes('meeting') || lowerInput.includes('book')) {
      setShowCalendar(true);
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

  const handleSingleOptionSelect = async (option) => {
    setQuoteMessages(prev => [
      ...prev,
      { id: `q_${Date.now()}`, type: 'ai_question', content: quoteFlow.currentStep.question, created_at: new Date().toISOString() },
      { id: `user_${Date.now()}`, type: 'user_selection', content: option.label, created_at: new Date().toISOString() }
    ]);
    
    const result = await quoteFlow.selectAndConfirm(option);
    if (result?.completed) {
      setQuoteMessages(prev => [
        ...prev,
        { id: `quote_${Date.now()}`, type: 'quote_result', content: result.quoteMessage, created_at: new Date().toISOString() }
      ]);
    }
  };

  const handleConfirmSelection = async () => {
    const currentQuestion = quoteFlow.currentStep?.question;
    const result = await quoteFlow.confirmSelection();
    if (result) {
      setQuoteMessages(prev => [
        ...prev,
        { id: `q_${Date.now()}`, type: 'ai_question', content: currentQuestion, created_at: new Date().toISOString() },
        { id: `user_${Date.now()}`, type: 'user_selection', content: result.selectedLabels, created_at: new Date().toISOString() }
      ]);
    }
  };

  const handleInlineTextSubmit = async (value) => {
    const currentQuestion = quoteFlow.currentStep?.question;
    setQuoteMessages(prev => [
      ...prev,
      { id: `q_${Date.now()}`, type: 'ai_question', content: currentQuestion, created_at: new Date().toISOString() },
      { id: `user_${Date.now()}`, type: 'user_input', content: value, created_at: new Date().toISOString() }
    ]);
    await quoteFlow.submitTextInput(value);
  };

  const handleStartQuote = () => {
    setQuoteMessages([]);
    quoteFlow.startFlow();
  };

  const handleScheduleCall = () => {
    setShowCalendar(true);
  };

  const handleBookingComplete = (details) => {
    setShowCalendar(false);
    setQuoteMessages(prev => [
      ...prev,
      { 
        id: `booking_${Date.now()}`, 
        type: 'booking_confirmed', 
        content: "Great! Your discovery call has been scheduled. You'll receive a confirmation email shortly with the meeting details. Looking forward to speaking with you! 🎉",
        created_at: new Date().toISOString()
      }
    ]);
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
              {quoteFlow.isActive && (
                <QuoteProgressMini progress={quoteFlow.progress} onStartOver={quoteFlow.cancelFlow} />
              )}
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

          {showCalendar && (
            <div className="calendar-overlay">
              <CalEmbed 
                calLink={calLink}
                onBookingComplete={handleBookingComplete}
                onClose={() => setShowCalendar(false)}
              />
            </div>
          )}

          <div className="messages-container">
            {allMessages.length === 0 && !quoteFlow.isActive && (
              <div className="message ai welcome">
                <div className="message-header">AI Assistant</div>
                <div className="message-content">
                  {greetingLoading ? (
                    <TypingIndicator />
                  ) : (
                    greeting || "Hey - anything I can help you with today?"
                  )}
                </div>
                {!greetingLoading && (
                  <QuickActions onStartQuote={handleStartQuote} onScheduleCall={handleScheduleCall} />
                )}
                <div className="message-time">{formatTime(new Date().toISOString())}</div>
              </div>
            )}
            
            {allMessages.map(msg => (
              <Message key={msg.id} message={msg} />
            ))}

            {quoteFlow.isActive && (
              <>
                {quoteMessages.map(msg => (
                  <QuoteMessage key={msg.id} message={msg} onScheduleCall={handleScheduleCall} />
                ))}

                {quoteFlow.isGeneratingQuote ? (
                  <div className="message ai generating-quote">
                    <div className="message-header">AI Assistant</div>
                    <div className="message-content">
                      <div className="generating-quote-indicator">
                        <span className="quote-gen-icon">📋</span>
                        <span>Crafting your personalized quote...</span>
                        <TypingIndicator />
                      </div>
                    </div>
                  </div>
                ) : quoteFlow.isLoadingQuestion ? (
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
                    onSingleSelect={handleSingleOptionSelect}
                    onConfirm={handleConfirmSelection}
                    onTextSubmit={handleInlineTextSubmit}
                  />
                )}
              </>
            )}

            {!quoteFlow.isActive && quoteMessages.length > 0 && (
              <>
                {quoteMessages.filter(m => m.type === 'quote_result' || m.type === 'booking_confirmed').map(msg => (
                  <QuoteMessage key={msg.id} message={msg} onScheduleCall={handleScheduleCall} />
                ))}
                {showBookCallButton && !showCalendar && (
                  <div className="book-call-cta">
                    <button className="book-call-btn" onClick={() => { setShowCalendar(true); setShowBookCallButton(false); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Book a Discovery Call
                    </button>
                  </div>
                )}
              </>
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
              {quoteFlow.isActive ? (
                quoteFlow.isGeneratingQuote ? (
                  <div className="generating-quote-notice">Generating your quote...</div>
                ) : (
                  <>
                    <input
                      ref={inputRef}
                      type={quoteFlow.currentStep?.inputType || 'text'}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={quoteFlow.currentStep?.inputType === 'email' 
                        ? 'Enter your work email...' 
                        : 'Type your answer or select above...'}
                      className="quote-input"
                      disabled={quoteFlow.isLoadingQuestion}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || quoteFlow.isLoadingQuestion}
                      className="send-button"
                    >
                      <SendIcon />
                    </button>
                  </>
                )
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

function QuickActions({ onStartQuote, onScheduleCall }) {
  return (
    <div className="quick-actions">
      <button className="quick-action-btn quote-btn" onClick={onStartQuote}>
        <svg className="quick-action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        Get Instant Quote
      </button>
      <button className="quick-action-btn schedule-btn" onClick={onScheduleCall}>
        <svg className="quick-action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Schedule a Call
      </button>
    </div>
  );
}

function QuoteProgressMini({ progress, onStartOver }) {
  return (
    <div className="quote-progress-mini">
      <div className="progress-mini-bar">
        <div 
          className="progress-mini-fill" 
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <span className="progress-mini-text">{progress.current}/{progress.total}</span>
      <button className="restart-btn" onClick={onStartOver} title="Start over">
        ↺
      </button>
    </div>
  );
}

function QuoteStep({ step, selectedOptions, onSelect, onConfirm, onSingleSelect, onTextSubmit }) {
  const [textInput, setTextInput] = useState('');
  
  const handleOptionClick = (option) => {
    if (step.multiSelect) {
      onSelect(option.value);
    } else {
      onSingleSelect(option);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextSubmit(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div className="quote-step">
      <div className="message ai">
        <div className="message-header">AI Assistant</div>
        <div className="message-content">
          <Markdown>{step.question}</Markdown>
        </div>
        <div className="message-time">{formatTime(new Date().toISOString())}</div>
      </div>

      {step.inputType === 'email' ? (
        <div className="quote-inline-input">
          <input
            type="email"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your work email..."
            className="inline-email-input"
            autoFocus
          />
          <button 
            className="inline-submit-btn"
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || !textInput.includes('@')}
          >
            Get Quote →
          </button>
        </div>
      ) : step.options.length > 0 ? (
        <div className="quote-options">
          {step.options.map(option => (
            <button
              key={option.value}
              className={`quote-option ${selectedOptions.includes(option.value) ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              <span className="option-label">{option.label}</span>
              {selectedOptions.includes(option.value) && (
                <span className="option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      ) : null}

      {step.multiSelect && selectedOptions.length > 0 && (
        <div className="quote-actions-sticky">
          <button 
            className="quote-nav-btn confirm" 
            onClick={onConfirm}
          >
            Continue ({selectedOptions.length}) →
          </button>
        </div>
      )}
    </div>
  );
}

function QuoteMessage({ message, onScheduleCall }) {
  if (message.type === 'quote_result') {
    return (
      <div className="message ai quote-result">
        <div className="message-header">AI Assistant</div>
        <div className="message-content quote-content">
          <Markdown>{message.content}</Markdown>
          {onScheduleCall && (
            <div className="quote-cta">
              <button className="schedule-call-btn" onClick={onScheduleCall}>
                <span>📅</span> Schedule Discovery Call
              </button>
              <span className="cta-note">No commitment - just a conversation</span>
            </div>
          )}
        </div>
        <div className="message-time">{formatTime(message.created_at)}</div>
      </div>
    );
  }

  if (message.type === 'booking_confirmed') {
    return (
      <div className="message ai booking-confirmed">
        <div className="message-header">AI Assistant</div>
        <div className="message-content">
          <Markdown>{message.content}</Markdown>
        </div>
        <div className="message-time">{formatTime(message.created_at)}</div>
      </div>
    );
  }

  if (message.type === 'ai_question') {
    return (
      <div className="message ai">
        <div className="message-header">AI Assistant</div>
        <div className="message-content">
          <Markdown>{message.content}</Markdown>
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
        {isAI ? <Markdown>{message.content}</Markdown> : message.content}
      </div>
      <div className="message-time">
        {formatTime(message.created_at)}
      </div>
    </div>
  );
}

function StatusBadge({ status, agentName }) {
  const statusConfig = {
    'ai_active': { text: 'Our custom built AI Assistant', color: 'blue' },
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
