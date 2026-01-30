import { ItemServicePort } from '../../application/ports/inbound/ItemServicePort';
import { Item } from '../models/Item';
import { ItemServicePort as OutboundItemServicePort } from '../../application/ports/outbound/ItemServicePort';

export class ItemService implements ItemServicePort {
  constructor(private readonly itemService: OutboundItemServicePort) {}

  async getItems(): Promise<Item[]> {
    return this.itemService.getItems();
  }

  async getItem(id: number): Promise<Item> {
    return this.itemService.getItem(id);
  }
}