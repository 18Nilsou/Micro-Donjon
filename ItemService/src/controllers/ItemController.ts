import { Express, Response, Request, NextFunction } from "express";
import { Item } from "../domain/model/Item";
import { ItemService } from "../services/ItemService";

export class ItemController {

  constructor(private itemService: ItemService) { }

  registerRoutes(app: Express) {
    app.get('/items', this.listAllItems.bind(this));
    app.get('/items/random', this.getRandomItem.bind(this));
    app.get('/items/:id', this.getItemById.bind(this));
  }

  async getRandomItem(req: Request, res: Response) {
    const item: Item = await this.itemService.getRandom();
    res.status(200).json(item);
  }

  async listAllItems(req: Request, res: Response) {
    const items: Item[] = await this.itemService.list();
    res.status(200).json(items);
  }

  async getItemById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id, 10);

    const item: Item = await this.itemService.getById(id);

    res.status(200).json(item);
  }
}
