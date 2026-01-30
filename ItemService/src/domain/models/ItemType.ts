import { ItemCategory } from './ItemCategory';
import { Effect } from './Effect';

export type Rarete = 'Commun' | 'Rare' | 'Epic' | 'Legendaire';

export interface ItemType {
  id: number;
  nom: string;
  description?: string;
  categorie: ItemCategory;
  effets: Effect[];
  rarete: Rarete;
}