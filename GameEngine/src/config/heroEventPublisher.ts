import { MessageBrokerPublisher } from './messageBrokerPublisher';

export class HeroEventPublisher extends MessageBrokerPublisher {
    constructor(rabbitmqUrl = 'amqp://rabbitmq:5672') {
        super(rabbitmqUrl, 'hero_events');
    }

    async publishHeroUpdate(heroId: string, healthPoints: number): Promise<void> {
        const message = {
            type: 'hero.update.health',
            heroId,
            healthPoints,
            timestamp: new Date().toISOString()
        };
        await this.publish('hero.update.health', message);
    }

    async publishHeroDelete(heroId: string): Promise<void> {
        const message = {
            type: 'hero.delete',
            heroId,
            timestamp: new Date().toISOString()
        };
        await this.publish('hero.delete', message);
    }

    async publishHeroLevelUp(heroId: string): Promise<void> {
        const message = {
            type: 'hero.update.level',
            heroId,
            timestamp: new Date().toISOString()
        };
        await this.publish('hero.update.level', message);
    }
}

const heroEventPublisher = new HeroEventPublisher(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
heroEventPublisher.connect();

export { heroEventPublisher };
