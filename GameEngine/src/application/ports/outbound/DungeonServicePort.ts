import { Dungeon } from '../../../domain/models/Dungeon';

export interface DungeonServicePort {
  createDungeon(dungeon: Dungeon): Promise<Dungeon>;
  getDungeon(id: string): Promise<Dungeon>;
}