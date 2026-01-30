import { ItemCategory } from '../../../domain/models/ItemCategory';

export interface ItemCategoryRepositoryPort {
  findAll(): ItemCategory[];

  findById(uuid: string): ItemCategory | undefined;

  insert(itemCategory: ItemCategory): ItemCategory;

  update(uuid: string, itemCategory: ItemCategory): ItemCategory;

  delete(uuid: string): boolean;
}