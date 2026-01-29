import { Item } from '../../domain/models/Item';
import { ItemRepositoryPort } from '../../application/ports/outbound/ItemRepositoryPort';
import * as fs from 'fs';
import * as path from 'path';

export class ItemRepositoryAdapter implements ItemRepositoryPort {
  private filePath = path.join(__dirname, '../../../data/items.json');

  private ensureDataDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): Item[] {
    this.ensureDataDir();
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    const data = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  private saveData(data: Item[]) {
    this.ensureDataDir();
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  findAll(): Item[] {
    return this.loadData();
  }

  findById(uuid: string): Item | undefined {
    return this.loadData().find(item => item.uuid === uuid);
  }

  insert(item: Item): Item {
    const data = this.loadData();
    if (data.find(i => i.uuid === item.uuid)) {
      throw new Error(`Item with UUID ${item.uuid} already exists`);
    }
    data.push(item);
    this.saveData(data);
    return item;
  }

  update(uuid: string, item: Item): Item {
    const data = this.loadData();
    const index = data.findIndex(i => i.uuid === uuid);
    if (index === -1) {
      throw new Error('Item not found for update');
    }
    const updated = { ...item, uuid };
    data[index] = updated;
    this.saveData(data);
    return updated;
  }

  delete(uuid: string): boolean {
    const data = this.loadData();
    const initialLength = data.length;
    const filtered = data.filter(item => item.uuid !== uuid);
    if (filtered.length < initialLength) {
      this.saveData(filtered);
      return true;
    }
    return false;
  }
}