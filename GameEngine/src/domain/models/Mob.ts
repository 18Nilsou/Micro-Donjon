import { Position } from "./Position";

export interface Mob {
  id: number;
  name: string;
  healthPoints: number;
  healthPointsMax: number;
  attackPoints: number;
  position?: Position;
  status?: 'alive' | 'dead';
}