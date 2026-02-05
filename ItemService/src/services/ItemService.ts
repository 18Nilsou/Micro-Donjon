import { Item } from "../domain/model/Item";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { logPublisher } from "../config/logPublisher";

export class ItemService {

  async list(): Promise<Item[]> {
    const items = require('../../data/items_data.json');

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_RETRIEVED', { itemJson: "all" });
    }

    return items;
  }

  async getRandom(): Promise<Item> {
    const items = await this.list();

    if (items.length === 0) {
      throw new NotFoundError('No items found');
    }

    const randomIndex = Math.floor(Math.random() * items.length);
    const item = items[randomIndex];

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_RETRIEVED_RANDOM', { itemId: item.id });
    }

    return item;
  }

  async getById(id: number): Promise<Item> {
    const items = await this.list();
    const item = items.find(item => item.id === Number(id));

    if (!item) {
      if (logPublisher) {
        await logPublisher.logError('ITEMS_GET_BY_ID', { id: id });
      }
      throw new NotFoundError('Item not found');
    }

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEM_GET_BY_ID', { itemId: id });
    }

    return item;
  }
}
