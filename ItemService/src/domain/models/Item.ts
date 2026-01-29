import { ItemType, Rarete } from './ItemType';
import { Position } from './Position';

export interface Item {
  uuid: string;
  itemType: ItemType;
  position: Position;
  roomId: string;
  rarete: Rarete;
}