import axios from 'axios';
import { Dungeon } from '../domain/models/Dungeon';
import { GenerateDungeonRequest } from '../domain/models/GenerateDungeonRequest';

export class DungeonService {

  private baseUrl: string = process.env.DUNGEON_SERVICE_URL || 'http://localhost:3002';

  async createDungeon(dungeon: Dungeon): Promise<Dungeon> {
    const response = await axios.post(`${this.baseUrl}/dungeons`, dungeon);
    return response.data;
  }

  async getDungeon(id: string): Promise<Dungeon> {
    const response = await axios.get(`${this.baseUrl}/dungeons/${id}`);
    return response.data;
  }

  async generateDungeon(request: GenerateDungeonRequest): Promise<Dungeon> {
    const response = await axios.post(`${this.baseUrl}/dungeons`, request);
    return response.data;
  }
}