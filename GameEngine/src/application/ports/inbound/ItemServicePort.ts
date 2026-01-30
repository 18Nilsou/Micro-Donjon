import { Item } from '../../../domain/models/Item';

export interface ItemServicePort {
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item>;
}