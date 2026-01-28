import type { ItemCategory, ItemType, Item } from "../schemas/types";

export class JsonStore {
  private categoriesPath = "./data/categories.json";
  private itemTypesPath = "./data/item-types.json";
  private itemsPath = "./data/items.json";

  constructor() {
    this.ensureDataDirectory();
  }

  private ensureDataDirectory() {
    const fs = require("fs");
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data", { recursive: true });
    }
  }

  private async readJson<T>(path: string, defaultValue: T): Promise<T> {
    try {
      const file = Bun.file(path);
      const exists = await file.exists();
      if (!exists) {
        await Bun.write(path, JSON.stringify(defaultValue, null, 2));
        return defaultValue;
      }
      const content = await file.json();
      return content;
    } catch (error) {
      return defaultValue;
    }
  }

  private async writeJson<T>(path: string, data: T): Promise<void> {
    await Bun.write(path, JSON.stringify(data, null, 2));
  }

  // Categories
  async getCategories(): Promise<ItemCategory[]> {
    return this.readJson<ItemCategory[]>(this.categoriesPath, []);
  }

  async getCategoryById(uuid: string): Promise<ItemCategory | undefined> {
    const categories = await this.getCategories();
    return categories.find((cat) => cat.uuid === uuid);
  }

  async saveCategories(categories: ItemCategory[]): Promise<void> {
    await this.writeJson(this.categoriesPath, categories);
  }

  // Item Types
  async getItemTypes(): Promise<ItemType[]> {
    return this.readJson<ItemType[]>(this.itemTypesPath, []);
  }

  async getItemTypeById(uuid: string): Promise<ItemType | undefined> {
    const itemTypes = await this.getItemTypes();
    return itemTypes.find((type) => type.uuid === uuid);
  }

  async saveItemType(itemType: ItemType): Promise<ItemType> {
    const itemTypes = await this.getItemTypes();
    const index = itemTypes.findIndex((t) => t.uuid === itemType.uuid);
    
    if (index >= 0) {
      itemTypes[index] = itemType;
    } else {
      itemTypes.push(itemType);
    }
    
    await this.writeJson(this.itemTypesPath, itemTypes);
    return itemType;
  }

  async deleteItemType(uuid: string): Promise<boolean> {
    const itemTypes = await this.getItemTypes();
    const filtered = itemTypes.filter((type) => type.uuid !== uuid);
    
    if (filtered.length === itemTypes.length) {
      return false;
    }
    
    await this.writeJson(this.itemTypesPath, filtered);
    return true;
  }

  // Items
  async getItems(): Promise<Item[]> {
    return this.readJson<Item[]>(this.itemsPath, []);
  }

  async getItemById(uuid: string): Promise<Item | undefined> {
    const items = await this.getItems();
    return items.find((item) => item.uuid === uuid);
  }

  async saveItem(item: Item): Promise<Item> {
    const items = await this.getItems();
    const index = items.findIndex((i) => i.uuid === item.uuid);
    
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    
    await this.writeJson(this.itemsPath, items);
    return item;
  }

  async deleteItem(uuid: string): Promise<boolean> {
    const items = await this.getItems();
    const filtered = items.filter((item) => item.uuid !== uuid);
    
    if (filtered.length === items.length) {
      return false;
    }
    
    await this.writeJson(this.itemsPath, filtered);
    return true;
  }
}

export const store = new JsonStore();
