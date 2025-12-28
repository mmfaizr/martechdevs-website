import pg from 'pg';
import config from '../config/index.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: config.database.url });

class DatabaseQueries {
  async createConversation({ customer_id, customer_name, customer_email, customer_metadata }) {
    const result = await pool.query(
      `INSERT INTO conversations (customer_id, customer_name, customer_email, customer_metadata, mode)
       VALUES ($1, $2, $3, $4, 'AI_ACTIVE')
       RETURNING *`,
      [customer_id, customer_name, customer_email, customer_metadata || {}]
    );
    return result.rows[0];
  }

  async getConversation(id) {
    const result = await pool.query(
      'SELECT * FROM conversations WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async getConversationByCustomer(customer_id) {
    const result = await pool.query(
      `SELECT * FROM conversations 
       WHERE customer_id = $1 AND mode != 'CLOSED'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [customer_id]
    );
    return result.rows[0];
  }

  async getConversationByThread(slack_channel_id, slack_thread_ts) {
    const result = await pool.query(
      'SELECT * FROM conversations WHERE slack_channel_id = $1 AND slack_thread_ts = $2',
      [slack_channel_id, slack_thread_ts]
    );
    return result.rows[0];
  }

  async updateConversation(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(id);
    const result = await pool.query(
      `UPDATE conversations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async updateConversationMode(id, mode) {
    const result = await pool.query(
      'UPDATE conversations SET mode = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [mode, id]
    );
    return result.rows[0];
  }

  async createMessage({ conversation_id, content, sender_type, source, slack_message_ts, slack_event_id, metadata }) {
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, content, sender_type, source, slack_message_ts, slack_event_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [conversation_id, content, sender_type, source || 'widget', slack_message_ts, slack_event_id, metadata || {}]
    );
    return result.rows[0];
  }

  async getMessage(id) {
    const result = await pool.query(
      'SELECT * FROM messages WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async getMessages(conversation_id, limit = 100) {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC
       LIMIT $2`,
      [conversation_id, limit]
    );
    return result.rows;
  }

  async getUnhandledCustomerMessages(conversation_id, last_handled_id) {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 
       AND sender_type = 'customer' 
       AND id > $2
       ORDER BY created_at ASC`,
      [conversation_id, last_handled_id || 0]
    );
    return result.rows;
  }

  async messageExistsBySlackEvent(slack_event_id) {
    const result = await pool.query(
      'SELECT id FROM messages WHERE slack_event_id = $1',
      [slack_event_id]
    );
    return result.rows.length > 0;
  }

  async createEvent({ conversation_id, event_type, actor, metadata }) {
    const result = await pool.query(
      `INSERT INTO conversation_events (conversation_id, event_type, actor, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversation_id, event_type, actor, metadata || {}]
    );
    return result.rows[0];
  }

  async getEvents(conversation_id, limit = 50) {
    const result = await pool.query(
      `SELECT * FROM conversation_events 
       WHERE conversation_id = $1 
       ORDER BY created_at DESC
       LIMIT $2`,
      [conversation_id, limit]
    );
    return result.rows;
  }

  async close() {
    await pool.end();
  }
}

export default new DatabaseQueries();




