import { Item } from '../../domain/models/Item';
import { ItemServicePort } from '../../application/ports/outbound/ItemServicePort';
import axios from 'axios';

export class ItemServiceAdapter implements ItemServicePort {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.ITEM_SERVICE_URL || 'http://item-service:3004'}/api`;
  }

  async getItems(): Promise<Item[]> {
    const response = await axios.get(`${this.baseUrl}/items`);
    return response.data;
  }

  async getItem(id: number): Promise<Item> {
    const response = await axios.get(`${this.baseUrl}/items/${id}`);
    return response.data;
  }
}