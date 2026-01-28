const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const amqp = require('amqplib');

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DB_URL || 'postgres://user:password@postgres-log:5432/log_db',
});

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

let channel = null;

async function retryWithBackoff(fn, maxRetries = 10, initialDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      if (isLastAttempt) {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function initDatabase() {
  await retryWithBackoff(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        service VARCHAR(100) NOT NULL,
        action VARCHAR(200) NOT NULL,
        message TEXT,
        level VARCHAR(50) DEFAULT 'INFO',
        user_id VARCHAR(100),
        session_id VARCHAR(100),
        metadata JSONB
      )
    `);
    console.log('Database initialized successfully');
  });
}

async function connectToRabbitMQ() {
  await retryWithBackoff(async () => {
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    
    await channel.assertExchange('game_events', 'topic', { durable: true });
    
    const queue = await channel.assertQueue('logs_queue', { durable: true });
    
    const routingKeys = [
      'hero.*',
      'game.*', 
      'dungeon.*',
      'item.*',
      'mob.*',
      'auth.*',
      'error.*'
    ];
    
    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue.queue, 'game_events', routingKey);
    }
    
    await channel.consume(queue.queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await saveLog(content, msg.fields.routingKey);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false); // Rejeter le message sans le remettre en queue
        }
      }
    }, { noAck: false });
    
    console.log('Connected to RabbitMQ and listening for messages...');
  });
}

async function saveLog(eventData, routingKey) {
  try {
    const {
      service,
      action,
      message,
      level = 'INFO',
      userId,
      sessionId,
      metadata
    } = eventData;

    await pool.query(`
      INSERT INTO logs (service, action, message, level, user_id, session_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      service || extractServiceFromRoutingKey(routingKey),
      action || 'EVENT_RECEIVED',
      message || JSON.stringify(eventData),
      level,
      userId,
      sessionId,
      metadata ? JSON.stringify(metadata) : null
    ]);

    console.log(`Log saved: ${service || routingKey} - ${action || 'EVENT'}`);
  } catch (error) {
    console.error('Error saving log:', error);
  }
}

function extractServiceFromRoutingKey(routingKey) {
  return routingKey.split('.')[0].toUpperCase() + '_SERVICE';
}

app.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 100, service, level, from, to } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM logs WHERE 1=1';
    let params = [];
    let paramIndex = 1;
    
    if (service) {
      query += ` AND service = $${paramIndex}`;
      params.push(service);
      paramIndex++;
    }
    
    if (level) {
      query += ` AND level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }
    
    if (from) {
      query += ` AND timestamp >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }
    
    if (to) {
      query += ` AND timestamp <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }
    
    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json({
      logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/logs/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        service,
        level,
        COUNT(*) as count,
        MAX(timestamp) as last_event
      FROM logs 
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
      GROUP BY service, level
      ORDER BY service, level
    `;
    
    const result = await pool.query(statsQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/logs/hero/:heroId', async (req, res) => {
  try {
    const { heroId } = req.params;
    
    if (!heroId) {
      return res.status(400).json({ error: 'Hero ID is required' });
    }
    
    // Recherche dans les métadonnées JSON et dans user_id
    const query = `
      SELECT * FROM logs 
      WHERE user_id = $1 
         OR metadata @> $2
         OR metadata->>'heroId' = $1
         OR metadata->>'hero_id' = $1
      ORDER BY timestamp DESC
    `;
    
    const result = await pool.query(query, [
      heroId,
      JSON.stringify({ heroId })
    ]);
    
    res.json({
      logs: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching hero logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'log-service',
    timestamp: new Date().toISOString(),
    rabbitmq_connected: channel !== null
  });
});

async function startService() {
  try {
    await initDatabase();
    await connectToRabbitMQ();
    
    app.listen(port, () => {
      console.log(`Log Service listening on port ${port}`);
      console.log('Service mode: PASSIVE - Only consuming messages from RabbitMQ');
    });
  } catch (error) {
    console.error('Error starting service:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (channel) {
    await channel.close();
  }
  await pool.end();
  process.exit(0);
});

startService();