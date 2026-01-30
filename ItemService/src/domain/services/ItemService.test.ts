import { ItemService } from './ItemService';
import { Item } from '../models/Item';
import { ItemType, Rarete } from '../models/ItemType';
import { Position } from '../models/Position';
import { ItemRepositoryPort } from '../../application/ports/outbound/ItemRepositoryPort';
import { ItemTypeRepositoryPort } from '../../application/ports/outbound/ItemTypeRepositoryPort';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';

describe('ItemService', () => {
  let itemService: ItemService;
  let mockItemRepo: jest.Mocked<ItemRepositoryPort>;
  let mockItemTypeRepo: jest.Mocked<ItemTypeRepositoryPort>;

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
    mockItemRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ItemRepositoryPort>;

    mockItemTypeRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ItemTypeRepositoryPort>;

    itemService = new ItemService(mockItemRepo, mockItemTypeRepo);
  });

  describe('get', () => {
    it('should return an item when found', () => {
      mockItemRepo.findById.mockReturnValue(mockItem);

      const result = itemService.get('item-uuid');

      expect(result).toEqual(mockItem);
      expect(mockItemRepo.findById).toHaveBeenCalledWith('item-uuid');
    });

    it('should throw NotFoundError when item not found', () => {
      mockItemRepo.findById.mockReturnValue(undefined);

      expect(() => itemService.get('non-existent')).toThrow(NotFoundError);
      expect(() => itemService.get('non-existent')).toThrow('Item not found');
    });
  });

  describe('list', () => {
    it('should return all items', () => {
      const items = [mockItem];
      mockItemRepo.findAll.mockReturnValue(items);

      const result = itemService.list();

      expect(result).toEqual(items);
      expect(mockItemRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('generate', () => {
    it('should generate and insert a new item', () => {
      const position: Position = { x: 10, y: 20 };
      mockItemTypeRepo.findById.mockReturnValue(mockItemType);
      mockItemRepo.insert.mockReturnValue(mockItem);

      const result = itemService.generate('Rare', 1, position, 'room-1');

      expect(mockItemTypeRepo.findById).toHaveBeenCalledWith(1);
      expect(mockItemRepo.insert).toHaveBeenCalled();
      const insertedItem = mockItemRepo.insert.mock.calls[0][0];
      expect(insertedItem.itemType).toEqual(mockItemType);
      expect(insertedItem.position).toEqual(position);
      expect(insertedItem.roomId).toBe('room-1');
      expect(insertedItem.rarete).toBe('Rare');
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundError when ItemType not found', () => {
      mockItemTypeRepo.findById.mockReturnValue(undefined);

      expect(() => itemService.generate('Commun', 999, { x: 0, y: 0 }, 'room-1')).toThrow(NotFoundError);
      expect(() => itemService.generate('Commun', 999, { x: 0, y: 0 }, 'room-1')).toThrow('ItemType not found');
    });
  });

  describe('delete', () => {
    it('should delete an existing item', () => {
      mockItemRepo.findById.mockReturnValue(mockItem);
      mockItemRepo.delete.mockReturnValue(true);

      const result = itemService.delete('item-uuid');

      expect(result).toBe(true);
      expect(mockItemRepo.findById).toHaveBeenCalledWith('item-uuid');
      expect(mockItemRepo.delete).toHaveBeenCalledWith('item-uuid');
    });

    it('should throw NotFoundError when trying to delete non-existent item', () => {
      mockItemRepo.findById.mockReturnValue(undefined);

      expect(() => itemService.delete('non-existent')).toThrow(NotFoundError);
    });
  });
});