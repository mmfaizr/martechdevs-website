import { Redis } from 'ioredis';
import config from '../config/index.js';

class RealtimeService {
  constructor() {
    this.connections = new Map();
    
    const redisUrl = config.redis.url;
    const redisOptions = {
      enableReadyCheck: true,
      connectTimeout: 10000
    };

    if (redisUrl.startsWith('rediss://')) {
      redisOptions.tls = { rejectUnauthorized: true };
    }

    this.subscriber = new Redis(redisUrl, redisOptions);
    this.publisher = new Redis(redisUrl, redisOptions);

    this.subscriber.subscribe('sse:broadcast', (err) => {
      if (err) {
        console.error('Failed to subscribe to SSE channel:', err);
      } else {
        console.log('✓ Subscribed to SSE broadcast channel');
      }
    });

    this.subscriber.on('message', (channel, message) => {
      if (channel === 'sse:broadcast') {
        try {
          const { conversationId, data } = JSON.parse(message);
          this.broadcastToConnections(conversationId, data);
        } catch (err) {
          console.error('Error processing SSE broadcast:', err);
        }
      }
    });
  }

  addConnection(conversationId, res) {
    if (!this.connections.has(conversationId)) {
      this.connections.set(conversationId, new Set());
    }
    
    const connections = this.connections.get(conversationId);
    connections.add(res);
    console.log(`[SSE] New connection for conversation ${conversationId}, total connections: ${connections.size}`);

    res.on('close', () => {
      console.log(`[SSE] Connection closed for conversation ${conversationId}`);
      connections.delete(res);
      if (connections.size === 0) {
        this.connections.delete(conversationId);
      }
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write('data: {"type":"connected"}\n\n');
  }

  sendToConversation(conversationId, data) {
    this.publisher.publish('sse:broadcast', JSON.stringify({ conversationId, data }));
  }

  broadcastToConnections(conversationId, data) {
    const connections = this.connections.get(conversationId);
    console.log(`[SSE] Broadcasting to conversation ${conversationId}, active connections: ${connections?.size || 0}`);
    
    if (!connections || connections.size === 0) {
      console.warn(`[SSE] No active connections for conversation ${conversationId}`);
      return;
    }

    const message = `data: ${JSON.stringify(data)}\n\n`;

    for (const res of connections) {
      try {
        res.write(message);
        console.log(`[SSE] Message sent successfully to conversation ${conversationId}`);
      } catch (error) {
        console.error('Error writing to SSE connection:', error);
        connections.delete(res);
      }
    }
  }

  getConnectionCount(conversationId) {
    return this.connections.get(conversationId)?.size || 0;
  }

  getAllConnections() {
    let total = 0;
    for (const connections of this.connections.values()) {
      total += connections.size;
    }
    return total;
  }
}

export default new RealtimeService();


