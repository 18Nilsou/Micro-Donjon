import { Express, Response, Request, NextFunction } from "express";
import { Item } from "../domains/model/Item";
import { ItemService } from "../services/ItemService";

export class ItemController {
  constructor(private itemService: ItemService) {}

  registerRoutes(app: Express) {
    app.get('/items', this.listAllItems.bind(this));
    app.get('/items/random', this.getRandom.bind(this));
    app.get('/items/:id', this.get.bind(this));
    app.post('/items', this.createItem.bind(this));
    app.put('/items/:id', this.updateItem.bind(this));
    app.delete('/items/:id', this.deleteItem.bind(this));
  }

  async getRandom(req: Request, res: Response, next: NextFunction) {
    try {
      const item: Item = await this.itemService.getRandom();
      res.status(200).json(item);
    } catch (e) {
      next(e);
    }
  }

  async listAllItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items: Item[] = await this.itemService.list();
      res.status(200).json(items);
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id: number = parseInt(req.params.id, 10);
      const item: Item = await this.itemService.get(id);
      res.status(200).json(item);
    } catch (e) {
      next(e);
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item: Item = req.body;
      const created = await this.itemService.create(item);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id: number = parseInt(req.params.id, 10);
      const item: Item = req.body;
      const updated = await this.itemService.update(id, item);
      res.status(200).json(updated);
    } catch (e) {
      next(e);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id: number = parseInt(req.params.id, 10);
      await this.itemService.delete(id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
