import { Effect } from './Effect';
import { Rarete } from './ItemType';

export interface ItemTypeCreate {
  nom: string;
  description?: string;
  categorieUuid: string;
  effets?: Effect[];
  rarete?: Rarete;
}

export interface ItemTypeUpdate {
  nom?: string;
  description?: string;
  categorieUuid?: string;
  effets?: Effect[];
  rarete?: Rarete;
}