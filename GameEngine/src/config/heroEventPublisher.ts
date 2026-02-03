import amqp, { Channel, ChannelModel } from 'amqplib';

export class HeroEventPublisher {
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
        this.exchangeName = 'hero_events';
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
                console.log(`Attempting to connect to RabbitMQ for hero events (attempt ${attempt}/${maxRetries})...`);
                this.connection = await amqp.connect(this.rabbitmqUrl);
                this.channel = await this.connection.createChannel();
                await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
                this.isConnected = true;
                console.log('Connected to RabbitMQ for hero events');

                this.connection.on('error', (err) => {
                    console.error('RabbitMQ hero events connection error:', err);
                    this.isConnected = false;
                });

                this.connection.on('close', () => {
                    console.log('RabbitMQ hero events connection closed, will attempt to reconnect...');
                    this.isConnected = false;
                    this.isConnecting = false;
                    setTimeout(() => this.connect(), 5000);
                });

                this.isConnecting = false;
                return;
            } catch (err: any) {
                console.error(`Failed to connect to RabbitMQ (attempt ${attempt}/${maxRetries}):`, err.message);

                if (attempt === maxRetries) {
                    console.error('Max retries reached, hero event publishing will be disabled');
                    this.isConnecting = false;
                    return;
                }

                const delay = initialDelay * Math.pow(1.5, attempt - 1);
                console.log(`Retrying in ${Math.round(delay / 1000)}s...`);
                await this.sleep(delay);
            }
        }
        this.isConnecting = false;
    }

    async publishHeroUpdate(heroId: string, healthPoints: number): Promise<void> {
        if (!this.isConnected || !this.channel) {
            console.warn('RabbitMQ not connected, skipping hero update event');
            return;
        }

        try {
            const message = {
                type: 'hero.update.health',
                heroId,
                healthPoints,
                timestamp: new Date().toISOString()
            };

            const routingKey = 'hero.update.health';
            this.channel.publish(
                this.exchangeName,
                routingKey,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );
        } catch (error) {
            console.error('Failed to publish hero update event:', error);
        }
    }

    async publishHeroDelete(heroId: string): Promise<void> {
        if (!this.isConnected || !this.channel) {
            console.warn('RabbitMQ not connected, skipping hero delete event');
            return;
        }

        try {
            const message = {
                type: 'hero.delete',
                heroId,
                timestamp: new Date().toISOString()
            };

            const routingKey = 'hero.delete';
            this.channel.publish(
                this.exchangeName,
                routingKey,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );
        } catch (error) {
            console.error('Failed to publish hero delete event:', error);
        }
    }

    async publishHeroLevelUp(heroId: string): Promise<void> {
        if (!this.isConnected || !this.channel) {
            console.warn('RabbitMQ not connected, skipping hero level up event');
            return;
        }

        try {
            const message = {
                type: 'hero.update.level',
                heroId,
                timestamp: new Date().toISOString()
            };

            const routingKey = 'hero.update.level';
            this.channel.publish(
                this.exchangeName,
                routingKey,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );
        } catch (error) {
            console.error('Failed to publish hero level up event:', error);
        }
    }


    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.isConnected = false;
        } catch (error) {
            console.error('Error closing RabbitMQ hero event connection:', error);
        }
    }
}

const heroEventPublisher = new HeroEventPublisher();
heroEventPublisher.connect();

export { heroEventPublisher };
