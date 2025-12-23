import { useState, useEffect, useCallback, useRef } from 'react';

export function useChat(apiUrl, customerInfo) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('ai_active');
  const [agentName, setAgentName] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    initConversation();

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const initConversation = async () => {
    try {
      const res = await fetch(`${apiUrl}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerInfo)
      });
      
      if (!res.ok) throw new Error('Failed to create conversation');
      
      const data = await res.json();
      setConversationId(data.id);
      setMessages(data.messages || []);
      setStatus(data.mode.toLowerCase());

      connectSSE(data.id);
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const connectSSE = useCallback((convId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`${apiUrl}/conversations/${convId}/stream`);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      console.log('SSE connected');
    };

    es.onerror = () => {
      setIsConnected(false);
      console.log('SSE error, will retry...');
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSSE(convId);
      }, 3000);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'connected':
            setIsConnected(true);
            break;
          
          case 'message':
            setMessages(prev => {
              const exists = prev.find(m => m.id === data.message.id);
              if (exists) return prev;
              return [...prev, data.message];
            });
            setIsLoading(false);
            break;
          
          case 'status':
            setStatus(data.status);
            if (data.agent_name) setAgentName(data.agent_name);
            setIsLoading(false);
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };
  }, [apiUrl]);

  const sendMessage = useCallback(async (content) => {
    if (!conversationId) return;

    const tempMessage = {
      id: `temp_${Date.now()}`,
      content,
      sender_type: 'customer',
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();

      setMessages(prev => 
        prev.map(m => m.id === tempMessage.id ? data : m)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  }, [conversationId, apiUrl]);

  return {
    messages,
    status,
    agentName,
    isConnected,
    isLoading,
    sendMessage
  };
}


