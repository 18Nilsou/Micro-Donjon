import amqp, { Channel, Connection, Message } from 'amqplib';
import { HeroService } from '../services/HeroService';

const rabbitmqUrl: string = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
let channel: Channel | null = null;
let heroService: HeroService | null = null;

export function setHeroService(service: HeroService): void {
    heroService = service;
}

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

async function handleHeroMessage(content: any): Promise<void> {
    if (!heroService) {
        console.error('HeroService not initialized');
        return;
    }

    try {
        switch (content.type) {
            case 'hero.update.health':
                console.log(`Updating hero ${content.heroId} health to ${content.healthPoints}`);
                await heroService.updateHealthPoints(content.heroId, content.healthPoints);
                break;

            case 'hero.delete':
                console.log(`Deleting hero ${content.heroId}`);
                await heroService.delete(content.heroId);
                break;

            case 'hero.update.level':
                console.log(`Updating hero ${content.heroId} level to ${content.level}`);
                await heroService.updateLevel(content.heroId);
                break;

            default:
                console.log('Unknown hero message type:', content.type);
        }
    } catch (error) {
        console.error('Error processing hero message:', error);
        throw error;
    }
}

export async function connectToRabbitMQ(): Promise<void> {
    await retryWithBackoff(async () => {

        const connection = await amqp.connect(rabbitmqUrl);

        channel = await connection.createChannel();
        await channel.assertExchange('hero_events', 'topic', { durable: true });
        const queue = await channel.assertQueue('hero_updates_queue', { durable: true });

        const routingKeys: string[] = [
            'hero.update.*',
            'hero.delete'
        ];

        for (const routingKey of routingKeys) {
            await channel.bindQueue(queue.queue, 'hero_events', routingKey);
        }

        await channel.consume(queue.queue, async (msg: Message | null) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await handleHeroMessage(content);
                    channel!.ack(msg);
                } catch (error) {
                    console.error('Error processing message:', error);
                    channel!.nack(msg, false, false);
                }
            }
        }, { noAck: false });

        console.log('Connected to RabbitMQ and listening for hero messages...');
    });
}
