import { Mob } from '../../../domain/models/Mob';

export interface MobServicePort {
  getMob(id: number): Promise<Mob>;
  updateMob(id: number, mob: Mob): Promise<Mob>;
  getMobs(): Promise<Mob[]>;
  createMob(mob: Mob): Promise<Mob>;
  deleteMob(id: number): Promise<void>;
  deleteMobByData(mob: Mob): Promise<void>;
}