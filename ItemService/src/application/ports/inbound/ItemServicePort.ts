import { Item } from '../../../domain/models/Item';
import { Position } from '../../../domain/models/Position';
import { Rarete } from '../../../domain/models/ItemType';

export interface ItemServicePort {
  get(uuid: string): Item;

  list(): Item[];

  create(item: Item): Item;

  update(uuid: string, item: Item): Item;

  generate(rarity: Rarete, itemTypeId: number, position: Position, roomId: string): Item;

  delete(uuid: string): boolean;
}