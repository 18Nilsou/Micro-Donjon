import { FightServicePort } from '../../application/ports/inbound/FightServicePort';
import { Fight } from '../models/Fight';
import { GameRepositoryPort } from '../../application/ports/outbound/GameRepositoryPort';
import { MessageBrokerPort } from '../../application/ports/outbound/MessageBrokerPort';

export class FightService implements FightServicePort {
  constructor(
    private readonly gameRepo: GameRepositoryPort,
    private readonly messageBroker: MessageBrokerPort
  ) {}

  async startFight(fight: Fight): Promise<Fight> {
    // Logic to start fight
    await this.messageBroker.notifyAction('fight_started', fight);
    return fight;
  }

  async getFight(): Promise<Fight> {
    throw new Error('Not implemented');
  }

  async updateFight(updates: Partial<Fight>): Promise<Fight> {
    throw new Error('Not implemented');
  }

  async deleteFight(): Promise<void> {
    throw new Error('Not implemented');
  }
}