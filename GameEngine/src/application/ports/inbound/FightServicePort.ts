import { Fight } from '../../../domain/models/Fight';

export interface FightServicePort {
  startFight(fight: Fight): Promise<Fight>;
  getFight(): Promise<Fight>;
  updateFight(fight: Partial<Fight>): Promise<Fight>;
  deleteFight(): Promise<void>;
}