import { Express, Response, Request } from 'express';
import { ItemService } from '../services/ItemService';

export class ItemController {

  constructor(private itemService: ItemService) { }

  registerRoutes(app: Express) {
    app.get('/items', this.getItems.bind(this));
    app.get('/items/:itemId', this.getItem.bind(this));
  }

  async getItems(req: Request, res: Response) {
    try {
      const items = await this.itemService.getItems();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getItem(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.itemId);
      const item = await this.itemService.getItem(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }
}