import amqp, { Channel, ChannelModel } from 'amqplib';

export class LogPublisher {
  private rabbitmqUrl: string;
  private channel: Channel | null;
  private connection: ChannelModel | null;
  private exchangeName: string;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;

  constructor(rabbitmqUrl = 'amqp://rabbitmq:5672') {
    this.rabbitmqUrl = rabbitmqUrl;
    this.channel = null;
    this.connection = null;
    this.exchangeName = 'game_events';
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      return;
    }
    this.isConnecting = true;

    const maxRetries = 15;
    const initialDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting to connect to RabbitMQ (attempt ${attempt}/${maxRetries})...`);
        this.connection = await amqp.connect(this.rabbitmqUrl);
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
        this.isConnected = true;
        console.log('Connected to RabbitMQ for logging');

        this.connection.on('error', (err) => {
          console.error('RabbitMQ connection error:', err);
          this.isConnected = false;
        });

        this.connection.on('close', () => {
          console.log('RabbitMQ connection closed, will attempt to reconnect...');
          this.isConnected = false;
          this.isConnecting = false;
          setTimeout(() => this.connect(), 5000);
        });

        this.isConnecting = false;
        return;
      } catch (error) {
        console.error(`RabbitMQ connection attempt ${attempt} failed:`, (error as Error).message);
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(1.5, attempt - 1);
          console.log(`Retrying in ${Math.round(delay / 1000)}s...`);
          await this.sleep(delay);
        }
      }
    }

    console.error('Failed to connect to RabbitMQ after all retries');
    this.isConnecting = false;
  }

  async publishLog(routingKey: string, logData: any): Promise<void> {
    if (!this.channel || !this.isConnected) {
      console.warn('RabbitMQ not connected, skipping log:', routingKey);
      return;
    }

    try {
      const message = Buffer.from(JSON.stringify(logData));
      this.channel.publish(this.exchangeName, routingKey, message, { persistent: true });
    } catch (error) {
      console.error('Error publishing log:', error);
    }
  }

  async logAuthEvent(action: string, heroData: any, userId: string | null = null, sessionId: string | null = null): Promise<void> {
    await this.publishLog('log.auth.' + action.toLowerCase(), {
      service: 'AUTH_SERVICE',
      action: action,
      message: `Auth event: ${action}`,
      level: 'INFO',
      userId,
      sessionId,
      metadata: heroData,
      timestamp: new Date().toISOString()
    });
  }

  async logError(error: any, context: any = {}, userId: string | null = null, sessionId: string | null = null): Promise<void> {
    await this.publishLog('log.error.auth', {
      service: 'AUTH_SERVICE',
      action: 'ERROR_OCCURRED',
      message: error.message || 'Unknown error',
      level: 'ERROR',
      userId,
      sessionId,
      metadata: {
        error: error.stack || error.toString(),
        context
      },
      timestamp: new Date().toISOString()
    });
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
  }
}

export let logPublisher: LogPublisher | null = null;

export async function initLogPublisher(): Promise<void> {
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
  logPublisher = new LogPublisher(rabbitmqUrl);
  await logPublisher.connect();
}