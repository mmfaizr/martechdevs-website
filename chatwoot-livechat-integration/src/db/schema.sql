-- Database schema for AI-powered chat system

-- Core conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer info
    customer_id VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_metadata JSONB DEFAULT '{}',
    
    -- State machine
    mode VARCHAR(50) DEFAULT 'AI_ACTIVE',
    -- Possible values: 'AI_ACTIVE', 'HANDOFF_PENDING', 'HUMAN_ACTIVE', 'CLOSED'
    
    -- Slack mapping
    slack_channel_id VARCHAR(50),
    slack_thread_ts VARCHAR(50),
    
    -- AI tracking
    last_customer_msg_id_handled BIGINT DEFAULT 0,
    pending_debounce_until TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    -- Possible values: 'customer', 'ai', 'human'
    
    -- Source tracking
    source VARCHAR(50) DEFAULT 'widget',
    -- Possible values: 'widget', 'slack'
    
    -- Slack reference for mapping replies
    slack_message_ts VARCHAR(50),
    slack_event_id VARCHAR(255),
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversation events for audit trail
CREATE TABLE IF NOT EXISTS conversation_events (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    -- Possible values: 'created', 'handoff_requested', 'human_takeover', 'closed', 'ai_resumed'
    actor VARCHAR(50),
    -- Format: 'ai', 'customer', 'agent:U12345'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_mode ON conversations(mode);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_slack_thread ON conversations(slack_channel_id, slack_thread_ts);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_slack_event ON messages(slack_event_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(conversation_id, sender_type);

CREATE INDEX IF NOT EXISTS idx_events_conversation ON conversation_events(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON conversation_events(event_type, created_at);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


