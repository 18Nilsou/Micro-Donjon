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
        uuid: item.uuid,
        name: item.name,
        effect: item.effect,
        value: item.value,
        description: item.description,
        rarity: item.rarity,
        itemType: item.item_type,
      }));
    } catch (error) {
      console.error("Error reading items file:", error);
      return [];
    }
  }

  private async writeItems(items: Item[]): Promise<void> {
    try {
      const data = items.map(item => ({
        uuid: item.uuid,
        name: item.name,
        effect: item.effect,
        value: item.value,
        description: item.description,
        rarity: item.rarity,
        item_type: item.itemType,
      }));
      await fs.writeFile(this.itemsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
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
      await logPublisher.logItemEvent('ITEMS_RETRIEVED', { itemId: item.uuid });
    }

    return item;
  }

  async get(uuid: string): Promise<Item> {
    const items = await this.readItems();
    const item = items.find(item => item.uuid === uuid);

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_RETRIEVED', { itemId: uuid });
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
    const uuid = uuidv4();
    
    const newItem: Item = {
      uuid,
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
      await logPublisher.logItemEvent('ITEMS_CREATED', { itemId: uuid });
    }

    return newItem;
  }

  async update(uuid: string, item: Item): Promise<Item> {
    const items = await this.readItems();
    const itemIndex = items.findIndex(i => i.uuid === uuid);

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found');
    }

    const updatedItem: Item = {
      uuid,
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
      await logPublisher.logItemEvent('ITEMS_UPDATED', { itemId: uuid });
    }

    return updatedItem;
  }

  async delete(uuid: string): Promise<boolean> {
    const items = await this.readItems();
    const itemIndex = items.findIndex(i => i.uuid === uuid);

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found');
    }

    items.splice(itemIndex, 1);
    await this.writeItems(items);

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_DELETED', { itemId: uuid });
    }

    return true;
  }
}
