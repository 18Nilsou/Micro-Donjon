import { ItemServicePort } from '../../application/ports/inbound/ItemServicePort';
import { Item } from '../models/Item';
import { Position } from '../models/Position';
import { Rarete } from '../models/ItemType';
import { ItemRepositoryPort } from '../../application/ports/outbound/ItemRepositoryPort';
import { ItemTypeRepositoryPort } from '../../application/ports/outbound/ItemTypeRepositoryPort';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';
import { v4 as uuidv4 } from 'uuid';

export class ItemService implements ItemServicePort {
  constructor(
    private readonly itemRepo: ItemRepositoryPort,
    private readonly itemTypeRepo: ItemTypeRepositoryPort
  ) {}

  get(uuid: string): Item {
    const item = this.itemRepo.findById(uuid);
    if (!item) {
      throw new NotFoundError('Item not found');
    }
    return item;
  }

  list(): Item[] {
    return this.itemRepo.findAll();
  }

  create(item: Item): Item {
    return this.itemRepo.insert(item);
  }

  update(uuid: string, item: Item): Item {
    return this.itemRepo.update(uuid, item);
  }

  generate(rarity: Rarete, itemTypeId: number, position: Position, roomId: string): Item {
    const itemType = this.itemTypeRepo.findById(itemTypeId);
    if (!itemType) {
      throw new NotFoundError('ItemType not found');
    }
    const item: Item = {
      uuid: uuidv4(),
      itemType,
      position,
      roomId,
      rarete: rarity
    };
    return this.itemRepo.insert(item);
  }

  delete(uuid: string): boolean {
    this.get(uuid);
    return this.itemRepo.delete(uuid);
  }
}