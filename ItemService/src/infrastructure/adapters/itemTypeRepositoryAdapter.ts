import { ItemType } from '../../domain/models/ItemType';
import { ItemTypeRepositoryPort } from '../../application/ports/outbound/ItemTypeRepositoryPort';
import * as fs from 'fs';
import * as path from 'path';

export class ItemTypeRepositoryAdapter implements ItemTypeRepositoryPort {
  private filePath = path.join(__dirname, '../../../data/itemTypes.json');

  private ensureDataDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): ItemType[] {
    this.ensureDataDir();
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    const data = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  private saveData(data: ItemType[]) {
    this.ensureDataDir();
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  private getNextId(): number {
    const data = this.loadData();
    return data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
  }

  findAll(): ItemType[] {
    return this.loadData();
  }

  findById(id: number): ItemType | undefined {
    return this.loadData().find(type => type.id === id);
  }

  insert(itemType: ItemType): ItemType {
    const data = this.loadData();
    const newId = this.getNextId();
    const newItemType = { ...itemType, id: newId };
    data.push(newItemType);
    this.saveData(data);
    return newItemType;
  }

  update(id: number, itemType: ItemType): ItemType {
    const data = this.loadData();
    const index = data.findIndex(type => type.id === id);
    if (index === -1) {
      throw new Error('ItemType not found for update');
    }
    const updated = { ...itemType, id };
    data[index] = updated;
    this.saveData(data);
    return updated;
  }

  delete(id: number): boolean {
    const data = this.loadData();
    const initialLength = data.length;
    const filtered = data.filter(type => type.id !== id);
    if (filtered.length < initialLength) {
      this.saveData(filtered);
      return true;
    }
    return false;
  }
}