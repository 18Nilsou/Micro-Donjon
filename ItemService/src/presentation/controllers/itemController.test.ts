import request from 'supertest';
import express from 'express';
import { ItemController } from './itemController';
import { ItemServicePort } from '../../application/ports/inbound/ItemServicePort';
import { Item } from '../../domain/models/Item';
import { ItemType, Rarete } from '../../domain/models/ItemType';
import { Position } from '../../domain/models/Position';
import { ItemGenerate } from '../../domain/models/ItemGenerate';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { errorHandler } from '../../application/errorHandling';

describe('ItemController', () => {
  let app: express.Express;
  let itemController: ItemController;
  let mockItemService: jest.Mocked<ItemServicePort>;

  const mockItemType: ItemType = {
    id: 1,
    nom: 'Sword',
    description: 'A sharp sword',
    categorie: { uuid: 'cat1', nom: 'Weapon' },
    effets: [],
    rarete: 'Commun'
  };

  const mockItem: Item = {
    uuid: 'item-uuid',
    itemType: mockItemType,
    position: { x: 0, y: 0 },
    roomId: 'room-1',
    rarete: 'Commun'
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockItemService = {
      get: jest.fn(),
      list: jest.fn(),
      generate: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ItemServicePort>;

    itemController = new ItemController(mockItemService);
    itemController.registerRoutes(app);
    app.use(errorHandler);
  });

  describe('GET /api/item-instances', () => {
    it('should return all items', async () => {
      const items = [mockItem];
      mockItemService.list.mockReturnValue(items);

      const response = await request(app).get('/api/item-instances');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(items);
      expect(mockItemService.list).toHaveBeenCalled();
    });
  });

  describe('GET /api/item-instances/:uuid', () => {
    it('should return an item by uuid', async () => {
      mockItemService.get.mockReturnValue(mockItem);

      const response = await request(app).get('/api/item-instances/item-uuid');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItem);
      expect(mockItemService.get).toHaveBeenCalledWith('item-uuid');
    });

    it('should return 404 when item not found', async () => {
      mockItemService.get.mockImplementation(() => { throw new NotFoundError('Item not found'); });

      const response = await request(app).get('/api/item-instances/non-existent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ name: 'NotFoundError', message: 'Item not found' });
    });
  });

  describe('POST /api/items/generate', () => {
    it('should generate a new item', async () => {
      const generateData: ItemGenerate = {
        rarity: 'Rare',
        itemTypeId: 1,
        position: { x: 10, y: 20 },
        roomId: 'room-1'
      };
      mockItemService.generate.mockReturnValue(mockItem);

      const response = await request(app)
        .post('/api/items/generate')
        .send(generateData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockItem);
      expect(mockItemService.generate).toHaveBeenCalledWith('Rare', 1, { x: 10, y: 20 }, 'room-1');
    });
  });
});