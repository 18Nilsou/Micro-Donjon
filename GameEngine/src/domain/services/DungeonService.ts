import { DungeonServicePort } from '../../application/ports/inbound/DungeonServicePort';
import { Dungeon } from '../models/Dungeon';
import { DungeonServicePort as OutboundDungeonServicePort } from '../../application/ports/outbound/DungeonServicePort';

export class DungeonService implements DungeonServicePort {
  constructor(private readonly dungeonService: OutboundDungeonServicePort) {}

  async createDungeon(dungeon: Dungeon): Promise<Dungeon> {
    return this.dungeonService.createDungeon(dungeon);
  }

  async getDungeon(): Promise<Dungeon> {
    // Need id
    throw new Error('Not implemented');
  }
}