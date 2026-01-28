const amqp = require('amqplib');

class LogPublisher {
  constructor(rabbitmqUrl = 'amqp://rabbitmq:5672') {
    this.rabbitmqUrl = rabbitmqUrl;
    this.channel = null;
    this.exchangeName = 'game_events';
  }

  async connect() {
    try {
      const connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      console.log('Connected to RabbitMQ for logging');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }


  async publishLog(routingKey, logData) {
    if (!this.channel) {
      await this.connect();
    }

    try {
      const message = Buffer.from(JSON.stringify(logData));
      this.channel.publish(this.exchangeName, routingKey, message, { persistent: true });
    } catch (error) {
      console.error('Error publishing log:', error);
    }
  }

  async logHeroEvent(action, heroData, userId = null, sessionId = null) {
    await this.publishLog('hero.' + action.toLowerCase(), {
      service: 'HERO_SERVICE',
      action: action,
      message: `Hero event: ${action}`,
      level: 'INFO',
      userId,
      sessionId,
      metadata: heroData
    });
  }

  async logGameEvent(action, gameData, userId = null, sessionId = null) {
    await this.publishLog('game.' + action.toLowerCase(), {
      service: 'GAME_SERVICE', 
      action: action,
      message: `Game event: ${action}`,
      level: 'INFO',
      userId,
      sessionId,
      metadata: gameData
    });
  }

  async logDungeonEvent(action, dungeonData, userId = null, sessionId = null) {
    await this.publishLog('dungeon.' + action.toLowerCase(), {
      service: 'DUNGEON_SERVICE',
      action: action,
      message: `Dungeon event: ${action}`,
      level: 'INFO',
      userId,
      sessionId,
      metadata: dungeonData
    });
  }

  async logItemEvent(action, itemData, userId = null, sessionId = null) {
    await this.publishLog('item.' + action.toLowerCase(), {
      service: 'ITEM_SERVICE',
      action: action,
      message: `Item event: ${action}`,
      level: 'INFO',
      userId,
      sessionId,
      metadata: itemData
    });
  }

  async logMobEvent(action, mobData, userId = null, sessionId = null) {
    await this.publishLog('mob.' + action.toLowerCase(), {
      service: 'MOB_SERVICE',
      action: action,
      message: `Mob event: ${action}`,
      level: 'INFO',
      userId,
      sessionId,
      metadata: mobData
    });
  }

  async logError(service, error, context = {}, userId = null, sessionId = null) {
    await this.publishLog('error.' + service.toLowerCase(), {
      service: service.toUpperCase() + '_SERVICE',
      action: 'ERROR_OCCURRED',
      message: error.message || 'Unknown error',
      level: 'ERROR',
      userId,
      sessionId,
      metadata: {
        error: error.stack || error.toString(),
        context
      }
    });
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
  }
}

module.exports = LogPublisher;