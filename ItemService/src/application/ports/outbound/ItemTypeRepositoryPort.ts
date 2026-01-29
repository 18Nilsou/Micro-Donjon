import { ItemType } from '../../../domain/models/ItemType';

export interface ItemTypeRepositoryPort {
  findAll(): ItemType[];

  findById(id: number): ItemType | undefined;

  insert(itemType: ItemType): ItemType;

  update(id: number, itemType: ItemType): ItemType;

  delete(id: number): boolean;
}