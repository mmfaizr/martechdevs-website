class RealtimeService {
  constructor() {
    this.connections = new Map();
  }

  addConnection(conversationId, res) {
    if (!this.connections.has(conversationId)) {
      this.connections.set(conversationId, new Set());
    }
    
    const connections = this.connections.get(conversationId);
    connections.add(res);

    res.on('close', () => {
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
    const connections = this.connections.get(conversationId);
    if (!connections || connections.size === 0) return;

    const message = `data: ${JSON.stringify(data)}\n\n`;

    for (const res of connections) {
      try {
        res.write(message);
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


