import { Item } from '../../../domain/models/Item';

export interface ItemRepositoryPort {
  findAll(): Item[];

  findById(uuid: string): Item | undefined;

  insert(item: Item): Item;

  update(uuid: string, item: Item): Item;

  delete(uuid: string): boolean;
}