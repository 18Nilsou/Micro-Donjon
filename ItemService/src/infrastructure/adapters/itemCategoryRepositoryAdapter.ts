import { ItemCategory } from '../../domain/models/ItemCategory';
import { ItemCategoryRepositoryPort } from '../../application/ports/outbound/ItemCategoryRepositoryPort';
import * as fs from 'fs';
import * as path from 'path';

export class ItemCategoryRepositoryAdapter implements ItemCategoryRepositoryPort {
  private filePath = path.join(__dirname, '../../../data/itemCategories.json');

  private ensureDataDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): ItemCategory[] {
    this.ensureDataDir();
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    const data = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  private saveData(data: ItemCategory[]) {
    this.ensureDataDir();
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  findAll(): ItemCategory[] {
    return this.loadData();
  }

  findById(uuid: string): ItemCategory | undefined {
    return this.loadData().find(cat => cat.uuid === uuid);
  }

  insert(itemCategory: ItemCategory): ItemCategory {
    const data = this.loadData();
    if (data.find(cat => cat.uuid === itemCategory.uuid)) {
      throw new Error(`ItemCategory with UUID ${itemCategory.uuid} already exists`);
    }
    data.push(itemCategory);
    this.saveData(data);
    return itemCategory;
  }

  update(uuid: string, itemCategory: ItemCategory): ItemCategory {
    const data = this.loadData();
    const index = data.findIndex(cat => cat.uuid === uuid);
    if (index === -1) {
      throw new Error('ItemCategory not found for update');
    }
    const updated = { ...itemCategory, uuid };
    data[index] = updated;
    this.saveData(data);
    return updated;
  }

  delete(uuid: string): boolean {
    const data = this.loadData();
    const initialLength = data.length;
    const filtered = data.filter(cat => cat.uuid !== uuid);
    if (filtered.length < initialLength) {
      this.saveData(filtered);
      return true;
    }
    return false;
  }
}