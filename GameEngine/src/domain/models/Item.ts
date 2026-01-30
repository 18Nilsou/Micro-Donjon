import { ItemType } from './ItemType';
import { Position } from './Position';

export interface Item {
  uuid: string;
  nom: string;
  rarete: 'Commun' | 'Rare' | 'Epic' | 'Legendaire';
  type: ItemType;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
  };
  position?: Position;
  roomId?: string;
}