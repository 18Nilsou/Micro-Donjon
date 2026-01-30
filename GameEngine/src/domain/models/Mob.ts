import { Position } from './Position';

export interface Mob {
  id: number;
  name: string;
  hp: number;
  hpMax?: number;
  attack: number;
  defense?: number;
  experience?: number;
  position?: Position;
  status?: 'alive' | 'dead';
}