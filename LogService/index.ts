import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool, PoolClient, QueryResult } from 'pg';
import amqp, { Channel, Connection, Message } from 'amqplib';

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3005;

app.use(cors());
app.use(express.json());

const pool: Pool = new Pool({
  connectionString: process.env.DB_URL || 'postgres://user:password@postgres-log:5432/log_db',
});

const rabbitmqUrl: string = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
let channel: Channel | null = null;

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 10, initialDelay: number = 1000): Promise<T> {
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
  throw new Error('Max retries exceeded');
}

async function initDatabase(): Promise<void> {
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

async function connectToRabbitMQ(): Promise<void> {
  await retryWithBackoff(async () => {

    const connection: Connection = await amqp.connect(rabbitmqUrl);

    channel = await connection.createChannel();
    await channel.assertExchange('game_events', 'topic', { durable: true });
    const queue = await channel.assertQueue('logs_queue', { durable: true });

    const routingKeys: string[] = [
      'log.*'
    ];

    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue.queue, 'game_events', routingKey);
    }

    await channel.consume(queue.queue, async (msg: Message | null) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await saveLog(content, msg.fields.routingKey);
          channel!.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel!.nack(msg, false, false);
        }
      }
    }, { noAck: false });

    console.log('Connected to RabbitMQ and listening for messages...');
  });
}

interface LogEventData {
  service?: string;
  action?: string;
  message?: string;
  level?: string;
  userId?: string;
  sessionId?: string;
  metadata?: any;
}

async function saveLog(eventData: LogEventData, routingKey: string): Promise<void> {
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

    await pool.query(
      `INSERT INTO logs (service, action, message, level, user_id, session_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        service || extractServiceFromRoutingKey(routingKey),
        action || 'EVENT_RECEIVED',
        message || JSON.stringify(eventData),
        level,
        userId,
        sessionId,
        metadata ? JSON.stringify(metadata) : null
      ]
    );
    console.log(`Log saved: ${service || routingKey} - ${action || 'EVENT'}`);
  } catch (error) {
    console.error('Error saving log:', error);
  }
}

function extractServiceFromRoutingKey(routingKey: string): string {
  return routingKey.split('.')[0].toUpperCase() + '_SERVICE';
}

app.get('/logs', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 100, service, level, from, to } = req.query as Record<string, any>;
    const offset: number = (Number(page) - 1) * Number(limit);
    let query = 'SELECT * FROM logs WHERE 1=1';
    const params: any[] = [];
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
    params.push(Number(limit), offset);
    const result: QueryResult = await pool.query(query, params);
    res.json({
      logs: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/logs/stats', async (req: Request, res: Response) => {
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
    const result: QueryResult = await pool.query(statsQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/logs/hero/:heroId', async (req: Request, res: Response) => {
  try {
    const { heroId } = req.params;
    if (!heroId) {
      return res.status(400).json({ error: 'Hero ID is required' });
    }
    const query = `
      SELECT * FROM logs 
      WHERE user_id = $1 
         OR metadata @> $2
         OR metadata->>'heroId' = $1
         OR metadata->>'hero_id' = $1
      ORDER BY timestamp DESC
    `;
    const result: QueryResult = await pool.query(query, [
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

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    service: 'log-service',
    timestamp: new Date().toISOString(),
    postgres_connected: false,
    rabbitmq_connected: false
  };

  // Check PostgreSQL
  try {
    await pool.query('SELECT 1');
    health.postgres_connected = true;
  } catch (error) {
    health.status = 'degraded';
  }

  // Check RabbitMQ
  if (channel) {
    health.rabbitmq_connected = true;
  } else {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

async function startService(): Promise<void> {
  try {
    await initDatabase();
    await connectToRabbitMQ();
    app.listen(port, () => {
      console.log(`Log Service listening on port ${port}`);
      console.log(`Health check at http://localhost:${port}/health`);
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