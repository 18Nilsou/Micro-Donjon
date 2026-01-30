import { Position } from './Position';
import { Rarete } from './ItemType';

export interface ItemGenerate {
  rarity: Rarete;
  itemTypeId: number;
  position: Position;
  roomId: string;
}