import { Mob } from '../../domain/models/Mob';
import { MobServicePort } from '../../application/ports/outbound/MobServicePort';
import axios from 'axios';

export class MobServiceAdapter implements MobServicePort {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MOB_SERVICE_URL || 'http://localhost:3003';
  }

  async getMob(id: number): Promise<Mob> {
    const response = await axios.get(`${this.baseUrl}/mob/${id}`);
    return response.data;
  }

  async updateMob(id: number, mob: Mob): Promise<Mob> {
    const response = await axios.put(`${this.baseUrl}/mob/${id}`, mob);
    return response.data;
  }

  async getMobs(): Promise<Mob[]> {
    const response = await axios.get(`${this.baseUrl}/mob`);
    return response.data;
  }

  async createMob(mob: Mob): Promise<Mob> {
    const response = await axios.post(`${this.baseUrl}/mob`, mob);
    return response.data;
  }

  async deleteMob(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/mob/${id}`);
  }

  async deleteMobByData(mob: Mob): Promise<void> {
    await axios.delete(`${this.baseUrl}/mob`, { data: mob });
  }
}