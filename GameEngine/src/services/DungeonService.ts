import axios from 'axios';
import { Dungeon } from '../domain/models/Dungeon';
import { GenerateDungeonRequest } from '../domain/models/GenerateDungeonRequest';
import { logPublisher } from '../config/logPublisher';

export class DungeonService {

  private baseUrl: string = process.env.DUNGEON_SERVICE_URL || 'http://localhost:3002';

  async createDungeon(dungeon: Dungeon): Promise<Dungeon> {
    const response = await axios.post(`${this.baseUrl}/dungeons`, dungeon);
    if (logPublisher) {
      logPublisher.logGameEvent('DUNGEON_CREATED', { dungeonId: response.data.id, dungeonName: response.data.name });
    }
    return response.data;
  }

  async getDungeon(id: string): Promise<Dungeon> {
    const response = await axios.get(`${this.baseUrl}/dungeons/${id}`);
    if (logPublisher) {
      logPublisher.logGameEvent('DUNGEON_RETRIEVED', { dungeonId: id });
    }
    return response.data;
  }

  async generateDungeon(request: GenerateDungeonRequest): Promise<Dungeon> {
    const response = await axios.post(`${this.baseUrl}/dungeons`, request);
    if (logPublisher) {
      logPublisher.logGameEvent('DUNGEON_GENERATED', { dungeonId: response.data.id, dungeonName: response.data.name, numberOfRooms: request.numberOfRooms });
    }
    return response.data;
  }
}