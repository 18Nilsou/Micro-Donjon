import { MobServicePort } from '../../application/ports/inbound/MobServicePort';
import { Mob } from '../models/Mob';
import { MobServicePort as OutboundMobServicePort } from '../../application/ports/outbound/MobServicePort';

export class MobService implements MobServicePort {
  constructor(private readonly mobService: OutboundMobServicePort) {}

  async getMob(id: number): Promise<Mob> {
    return this.mobService.getMob(id);
  }

  async updateMob(id: number, mob: Mob): Promise<Mob> {
    return this.mobService.updateMob(id, mob);
  }

  async deleteMob(id: number): Promise<void> {
    return this.mobService.deleteMob(id);
  }

  async getMobs(): Promise<Mob[]> {
    return this.mobService.getMobs();
  }

  async createMob(mob: Mob): Promise<Mob> {
    return this.mobService.createMob(mob);
  }

  async deleteMobByData(mob: Mob): Promise<void> {
    return this.mobService.deleteMobByData(mob);
  }
}