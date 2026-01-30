import request from 'supertest';
import express from 'express';
import { ItemTypeController } from './itemTypeController';
import { ItemTypeServicePort } from '../../application/ports/inbound/ItemTypeServicePort';
import { ItemCategoryRepositoryPort } from '../../application/ports/outbound/ItemCategoryRepositoryPort';
import { ItemType, Rarete } from '../../domain/models/ItemType';
import { ItemCategory } from '../../domain/models/ItemCategory';
import { ItemTypeCreate, ItemTypeUpdate } from '../../domain/models/ItemTypeDTO';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { ValidationError } from '../../domain/errors/ValidationError';
import { errorHandler } from '../../application/errorHandling';

describe('ItemTypeController', () => {
  let app: express.Express;
  let itemTypeController: ItemTypeController;
  let mockItemTypeService: jest.Mocked<ItemTypeServicePort>;
  let mockItemCategoryRepo: jest.Mocked<ItemCategoryRepositoryPort>;

  const mockItemCategory: ItemCategory = {
    uuid: 'cat-uuid',
    nom: 'Weapon'
  };

  const mockItemType: ItemType = {
    id: 1,
    nom: 'Sword',
    description: 'A sharp sword',
    categorie: mockItemCategory,
    effets: [],
    rarete: 'Commun'
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockItemTypeService = {
      get: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ItemTypeServicePort>;

    mockItemCategoryRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ItemCategoryRepositoryPort>;

    itemTypeController = new ItemTypeController(mockItemTypeService, mockItemCategoryRepo);
    itemTypeController.registerRoutes(app);
    app.use(errorHandler);
  });

  describe('GET /api/items', () => {
    it('should return all item types', async () => {
      const itemTypes = [mockItemType];
      mockItemTypeService.list.mockReturnValue(itemTypes);

      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(itemTypes);
      expect(mockItemTypeService.list).toHaveBeenCalled();
    });
  });

  describe('GET /api/items/:itemTypeId', () => {
    it('should return an item type by id', async () => {
      mockItemTypeService.get.mockReturnValue(mockItemType);

      const response = await request(app).get('/api/items/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItemType);
      expect(mockItemTypeService.get).toHaveBeenCalledWith(1);
    });

    it('should return 404 when item type not found', async () => {
      mockItemTypeService.get.mockImplementation(() => { throw new NotFoundError('ItemType not found'); });

      const response = await request(app).get('/api/items/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ name: 'NotFoundError', message: 'ItemType not found' });
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item type', async () => {
      const createData: ItemTypeCreate = {
        nom: 'Axe',
        description: 'A mighty axe',
        categorieUuid: 'cat-uuid',
        effets: [],
        rarete: 'Rare'
      };
      mockItemCategoryRepo.findById.mockReturnValue(mockItemCategory);
      mockItemTypeService.create.mockReturnValue(mockItemType);

      const response = await request(app)
        .post('/api/items')
        .send(createData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockItemType);
      expect(mockItemCategoryRepo.findById).toHaveBeenCalledWith('cat-uuid');
      expect(mockItemTypeService.create).toHaveBeenCalled();
    });

    it('should return 400 when category is invalid', async () => {
      const createData: ItemTypeCreate = {
        nom: 'Axe',
        categorieUuid: 'invalid-uuid'
      };
      mockItemCategoryRepo.findById.mockReturnValue(undefined);

      const response = await request(app)
        .post('/api/items')
        .send(createData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid category UUID' });
    });

    it('should return 400 when validation fails', async () => {
      const createData: ItemTypeCreate = {
        nom: '',
        categorieUuid: 'cat-uuid'
      };
      mockItemCategoryRepo.findById.mockReturnValue(mockItemCategory);
      mockItemTypeService.create.mockImplementation(() => { throw new ValidationError('ItemType name cannot be empty'); });

      const response = await request(app)
        .post('/api/items')
        .send(createData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ name: 'ValidationError', message: 'ItemType name cannot be empty' });
    });
  });

  describe('PUT /api/items/:itemTypeId', () => {
    it('should update an item type', async () => {
      const updateData: ItemTypeUpdate = {
        nom: 'Updated Sword'
      };
      mockItemTypeService.get.mockReturnValue(mockItemType);
      mockItemTypeService.update.mockReturnValue({ ...mockItemType, nom: 'Updated Sword' });

      const response = await request(app)
        .put('/api/items/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(mockItemTypeService.update).toHaveBeenCalled();
    });

    it('should return 400 when updating to invalid category', async () => {
      const updateData: ItemTypeUpdate = {
        categorieUuid: 'invalid-uuid'
      };
      mockItemTypeService.get.mockReturnValue(mockItemType);
      mockItemCategoryRepo.findById.mockReturnValue(undefined);

      const response = await request(app)
        .put('/api/items/1')
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid category UUID' });
    });

    it('should return 404 when updating non-existent item type', async () => {
      const updateData: ItemTypeUpdate = {
        nom: 'Updated'
      };
      mockItemTypeService.get.mockImplementation(() => { throw new NotFoundError('ItemType not found'); });

      const response = await request(app)
        .put('/api/items/999')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ name: 'NotFoundError', message: 'ItemType not found' });
    });
  });

  describe('DELETE /api/items/:itemTypeId', () => {
    it('should delete an item type', async () => {
      mockItemTypeService.delete.mockReturnValue(true);

      const response = await request(app).delete('/api/items/1');

      expect(response.status).toBe(204);
      expect(mockItemTypeService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when deleting non-existent item type', async () => {
      mockItemTypeService.delete.mockImplementation(() => { throw new NotFoundError('ItemType not found'); });

      const response = await request(app).delete('/api/items/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ name: 'NotFoundError', message: 'ItemType not found' });
    });
  });
});