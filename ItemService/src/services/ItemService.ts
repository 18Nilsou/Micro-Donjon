import { Item } from "../domains/model/Item";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../domains/errors/NotFoundError";
import { logPublisher } from "../config/logPublisher";
import * as fs from "fs/promises";
import * as path from "path";

export class ItemService {

  private itemsFilePath: string;

  constructor() {
    this.itemsFilePath = path.join(__dirname, "../../data/items.json");
  }

  private async readItems(): Promise<Item[]> {
    try {
      const data = await fs.readFile(this.itemsFilePath, "utf-8");
      const items = JSON.parse(data);
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        effect: item.effect,
        value: item.value,
        description: item.description,
        rarity: item.rarity,
        itemType: item.item_type,
      }));
    } catch (error) {
      if(logPublisher) {
        await logPublisher.logError(error, { filePath: this.itemsFilePath });
      }
      console.error("Error reading items file:", error);
      return [];
    }
  }

  private async writeItems(items: Item[]): Promise<void> {
    try {
      const data = items.map(item => ({
        id: item.id,
        name: item.name,
        effect: item.effect,
        value: item.value,
        description: item.description,
        rarity: item.rarity,
        item_type: item.itemType,
      }));
      await fs.writeFile(this.itemsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      if(logPublisher) {
        await logPublisher.logError(error, { filePath: this.itemsFilePath });
      }
      console.error("Error writing items file:", error);
      throw error;
    }
  }

  async getRandom(): Promise<Item> {
    const items = await this.readItems();

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

  async get(id: number): Promise<Item> {
    const items = await this.readItems();
    const item = items.find(item => item.id === id);

    if (!item) {
      if (logPublisher) {
        await logPublisher.logError('ITEMS_GET_BY_ID', { id: id });
      }
      throw new NotFoundError('Item not found');
    }

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_RETRIEVED', { itemId: id });
    }

    return item;
  }

  async list(): Promise<Item[]> {
    const items = await this.readItems();

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_RETRIEVED', { itemId: "all" });
    }

    return items;
  }

  async create(item: Item): Promise<Item> {
    const items = await this.readItems();
    const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    
    const newItem: Item = {
      id,
      name: item.name,
      effect: item.effect,
      value: item.value,
      description: item.description,
      rarity: item.rarity,
      itemType: item.itemType
    };

    items.push(newItem);
    await this.writeItems(items);

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_CREATED', { itemId: id });
    }

    return newItem;
  }

  async update(id: number, item: Item): Promise<Item> {
    const items = await this.readItems();
    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      if (logPublisher) {
        await logPublisher.logError('ITEMS_UPDATE', { id: id });
      }
      throw new NotFoundError('Item not found');
    }

    const updatedItem: Item = {
      id,
      name: item.name,
      effect: item.effect,
      value: item.value,
      description: item.description,
      rarity: item.rarity,
      itemType: item.itemType
    };

    items[itemIndex] = updatedItem;
    await this.writeItems(items);

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_UPDATED', { itemId: id });
    }

    return updatedItem;
  }

  async delete(id: number): Promise<boolean> {
    const items = await this.readItems();
    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      if (logPublisher) {
        await logPublisher.logError('ITEMS_DELETE', { id: id });
      }
      throw new NotFoundError('Item not found');
    }

    items.splice(itemIndex, 1);
    await this.writeItems(items);

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_DELETED', { itemId: id });
    }

    return true;
  }
}
