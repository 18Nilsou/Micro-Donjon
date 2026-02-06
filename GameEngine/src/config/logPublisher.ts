import { MessageBrokerPublisher } from './messageBrokerPublisher';

export class LogPublisher extends MessageBrokerPublisher {
    constructor(rabbitmqUrl = 'amqp://rabbitmq:5672') {
        super(rabbitmqUrl, 'game_events');
    }

    async publishLog(routingKey: string, logData: any): Promise<void> {
        await this.publish(routingKey, logData);
    }

    async logGameEvent(action: string, gameData: any, userId: string | null = null, sessionId: string | null = null): Promise<void> {
        await this.publishLog('log.game.' + action.toLowerCase(), {
            service: 'GAME_SERVICE',
            action: action,
            message: `Game event: ${action}`,
            level: 'INFO',
            userId,
            sessionId,
            metadata: gameData,
            timestamp: new Date().toISOString()
        });
    }

    async logError(service: string, error: any, context: any = {}, userId: string | null = null, sessionId: string | null = null): Promise<void> {
        await this.publishLog('log.error.game' + service.toLowerCase(), {
            service: 'GAME_SERVICE',
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
}

const logPublisher = new LogPublisher(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
logPublisher.connect();

export { logPublisher };