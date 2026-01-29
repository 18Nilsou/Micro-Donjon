import { ItemServicePort } from '../../application/ports/inbound/ItemServicePort';
import { Express, Response, Request, NextFunction } from 'express';
import { ItemGenerate } from '../../domain/models/ItemGenerate';

export class ItemController {
  constructor(private itemService: ItemServicePort) {}

  registerRoutes(app: Express) {
    app.get('/api/item-instances', this.listAllItems.bind(this));
    app.get('/api/item-instances/:uuid', this.getItemById.bind(this));
    app.post('/api/items/generate', this.generateItem.bind(this));
  }

  listAllItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = this.itemService.list();
      res.status(200).json(items);
    } catch (e) {
      next(e);
    }
  }

  getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const uuid: string = req.params.uuid;
      const item = this.itemService.get(uuid);
      res.status(200).json(item);
    } catch (e) {
      next(e);
    }
  }

  generateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const generateData: ItemGenerate = req.body;
      const item = this.itemService.generate(generateData.rarity, generateData.itemTypeId, generateData.position, generateData.roomId);
      res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  }
}