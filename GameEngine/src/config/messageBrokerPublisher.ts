import amqp, { Channel, ChannelModel } from 'amqplib';

export abstract class MessageBrokerPublisher {
    protected rabbitmqUrl: string;
    protected channel: Channel | null;
    protected connection: ChannelModel | null;
    protected exchangeName: string;
    protected isConnected: boolean = false;
    protected isConnecting: boolean = false;

    constructor(rabbitmqUrl: string = 'amqp://rabbitmq:5672', exchangeName: string) {
        this.rabbitmqUrl = rabbitmqUrl;
        this.channel = null;
        this.connection = null;
        this.exchangeName = exchangeName;
    }

    protected async sleep(ms: number): Promise<void> {
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
                console.log(`Attempting to connect to RabbitMQ for ${this.exchangeName} (attempt ${attempt}/${maxRetries})...`);
                this.connection = await amqp.connect(this.rabbitmqUrl);
                this.channel = await this.connection.createChannel();
                await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
                this.isConnected = true;
                console.log(`Connected to RabbitMQ for ${this.exchangeName}`);

                this.connection.on('error', (err) => {
                    console.error(`RabbitMQ ${this.exchangeName} connection error:`, err);
                    this.isConnected = false;
                });

                this.connection.on('close', () => {
                    console.log(`RabbitMQ ${this.exchangeName} connection closed, will attempt to reconnect...`);
                    this.isConnected = false;
                    this.isConnecting = false;
                    setTimeout(() => this.connect(), 5000);
                });

                this.isConnecting = false;
                return;
            } catch (err: any) {
                console.error(`Failed to connect to RabbitMQ for ${this.exchangeName} (attempt ${attempt}/${maxRetries}):`, err.message);

                if (attempt === maxRetries) {
                    console.error(`Max retries reached for ${this.exchangeName}, publishing will be disabled`);
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

    protected async publish(routingKey: string, message: any): Promise<void> {
        if (!this.isConnected || !this.channel) {
            console.warn(`RabbitMQ not connected for ${this.exchangeName}, skipping message with routing key: ${routingKey}`);
            return;
        }

        try {
            this.channel.publish(
                this.exchangeName,
                routingKey,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );
        } catch (error) {
            console.error(`Failed to publish message to ${this.exchangeName}:`, error);
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
            console.error(`Error closing RabbitMQ ${this.exchangeName} connection:`, error);
        }
    }
}
