import { Item } from './Item';
import { Position } from './Position';

export interface Hero {
  id: string;
  name: string;
  healthPoints: number;
  healthPointsMax: number;
  level: number;
  attackPoints: number;
  experience?: number;
  gold?: number;
  inventory?: Item[];
  position?: Position;
}