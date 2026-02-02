import axios from 'axios';
import { Item } from '../domain/models/Item';

export class ItemService {

  private baseUrl: string = `${process.env.ITEM_SERVICE_URL || 'http://item-service:3004'}/api`;

  async getItems(): Promise<Item[]> {
    const response = await axios.get(`${this.baseUrl}/items`);
    return response.data;
  }

  async getItem(id: number): Promise<Item> {
    const response = await axios.get(`${this.baseUrl}/items/${id}`);
    return response.data;
  }
}