import { Dungeon } from '../../domain/models/Dungeon';
import { DungeonServicePort } from '../../application/ports/outbound/DungeonServicePort';
import axios from 'axios';

export class DungeonServiceAdapter implements DungeonServicePort {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DUNGEON_SERVICE_URL || 'http://localhost:3002';
  }

  async createDungeon(dungeon: Dungeon): Promise<Dungeon> {
    const response = await axios.post(`${this.baseUrl}/dungeon`, dungeon);
    return response.data;
  }

  async getDungeon(id: string): Promise<Dungeon> {
    const response = await axios.get(`${this.baseUrl}/dungeon/${id}`);
    return response.data;
  }
}