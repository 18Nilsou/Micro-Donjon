import { Item } from "./Item";

export interface Hero {
  id: string;
  name: string;
  healthPoints: number;
  healthPointsMax: number;
  level: number;
  attackPoints: number;
  inventory: Item[];
  class: string;
  gold: number;
}      
