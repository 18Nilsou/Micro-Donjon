import { MessageBrokerPort } from '../../application/ports/outbound/MessageBrokerPort';
import * as amqp from 'amqplib';

export class MessageBrokerAdapter implements MessageBrokerPort {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue('game_actions', { durable: true });
    } catch (error) {
      console.error('Failed to connect to message broker:', error);
    }
  }

  async notifyAction(action: string, details: any): Promise<void> {
    if (!this.channel) {
      console.warn('Message broker not connected');
      return;
    }
    const message = JSON.stringify({ action, details, timestamp: new Date().toISOString() });
    this.channel.sendToQueue('game_actions', Buffer.from(message));
  }
}