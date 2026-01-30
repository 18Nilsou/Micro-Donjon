import { ItemType } from '../../../domain/models/ItemType';

export interface ItemTypeServicePort {
  get(id: number): ItemType;

  list(): ItemType[];

  create(itemType: ItemType): ItemType;

  update(id: number, itemType: ItemType): ItemType;

  delete(id: number): boolean;
}