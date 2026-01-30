import { ItemTypeServicePort } from '../../application/ports/inbound/ItemTypeServicePort';
import { ItemCategoryRepositoryPort } from '../../application/ports/outbound/ItemCategoryRepositoryPort';
import { Express, Response, Request, NextFunction } from 'express';
import { ItemType } from '../../domain/models/ItemType';
import { ItemTypeCreate, ItemTypeUpdate } from '../../domain/models/ItemTypeDTO';
import { v4 as uuidv4 } from 'uuid';

export class ItemTypeController {
  constructor(
    private itemTypeService: ItemTypeServicePort,
    private itemCategoryRepo: ItemCategoryRepositoryPort
  ) {}

  registerRoutes(app: Express) {
    app.get('/api/items', this.listAllItemTypes.bind(this));
    app.post('/api/items', this.createItemType.bind(this));
    app.get('/api/items/:itemTypeId', this.getItemTypeById.bind(this));
    app.put('/api/items/:itemTypeId', this.updateItemType.bind(this));
    app.delete('/api/items/:itemTypeId', this.deleteItemType.bind(this));
  }

  listAllItemTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const itemTypes = this.itemTypeService.list();
      res.status(200).json(itemTypes);
    } catch (e) {
      next(e);
    }
  }

  getItemTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const itemTypeId: number = parseInt(req.params.itemTypeId);
      const itemType = this.itemTypeService.get(itemTypeId);
      res.status(200).json(itemType);
    } catch (e) {
      next(e);
    }
  }

  createItemType(req: Request, res: Response, next: NextFunction) {
    try {
      const createData: ItemTypeCreate = req.body;
      const categorie = this.itemCategoryRepo.findById(createData.categorieUuid);
      if (!categorie) {
        return res.status(400).json({ message: 'Invalid category UUID' });
      }
      const itemType: ItemType = {
        id: 0, // will be set in repo
        nom: createData.nom,
        description: createData.description,
        categorie,
        effets: createData.effets || [],
        rarete: createData.rarete || 'Commun'
      };
      const created = this.itemTypeService.create(itemType);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }

  updateItemType(req: Request, res: Response, next: NextFunction) {
    try {
      const itemTypeId: number = parseInt(req.params.itemTypeId);
      const updateData: ItemTypeUpdate = req.body;
      const existing = this.itemTypeService.get(itemTypeId);
      let categorie = existing.categorie;
      if (updateData.categorieUuid) {
        const newCat = this.itemCategoryRepo.findById(updateData.categorieUuid);
        if (!newCat) {
          return res.status(400).json({ message: 'Invalid category UUID' });
        }
        categorie = newCat;
      }
      const updatedItemType: ItemType = {
        ...existing,
        nom: updateData.nom || existing.nom,
        description: updateData.description !== undefined ? updateData.description : existing.description,
        categorie,
        effets: updateData.effets || existing.effets,
        rarete: updateData.rarete || existing.rarete
      };
      const updated = this.itemTypeService.update(itemTypeId, updatedItemType);
      res.status(200).json(updated);
    } catch (e) {
      next(e);
    }
  }

  deleteItemType(req: Request, res: Response, next: NextFunction) {
    try {
      const itemTypeId: number = parseInt(req.params.itemTypeId);
      this.itemTypeService.delete(itemTypeId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}