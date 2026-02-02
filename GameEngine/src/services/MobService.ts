import axios from 'axios';
import { Mob } from '../domain/models/Mob';

export class MobService {
  private baseUrl: string = process.env.MOB_SERVICE_URL || 'http://localhost:3003';

  async getMob(id: number): Promise<Mob> {
    const response = await axios.get(`${this.baseUrl}/mobs/${id}`);
    return response.data;
  }

  async updateMob(id: number, mob: Mob): Promise<Mob> {
    const response = await axios.put(`${this.baseUrl}/mobs/${id}`, mob);
    return response.data;
  }

  async getMobs(): Promise<Mob[]> {
    const response = await axios.get(`${this.baseUrl}/mobs`);
    return response.data;
  }

  async getMobsByType(type: 'Common' | 'Boss'): Promise<Mob[]> {
    const response = await axios.get(`${this.baseUrl}/mobs/type/${type}`);
    return response.data;
  }

  async createMob(mob: Mob): Promise<Mob> {
    const response = await axios.post(`${this.baseUrl}/mobs`, mob);
    return response.data;
  }

  async deleteMob(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/mobs/${id}`);
  }

  async deleteMobByData(mob: Mob): Promise<void> {
    await axios.delete(`${this.baseUrl}/mobs`, { data: mob });
  }
}