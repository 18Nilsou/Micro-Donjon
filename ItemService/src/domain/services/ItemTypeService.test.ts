import { ItemTypeService } from './ItemTypeService';
import { ItemType, Rarete } from '../models/ItemType';
import { ItemCategory } from '../models/ItemCategory';
import { Effect } from '../models/Effect';
import { ItemTypeRepositoryPort } from '../../application/ports/outbound/ItemTypeRepositoryPort';
import { ItemCategoryRepositoryPort } from '../../application/ports/outbound/ItemCategoryRepositoryPort';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';

describe('ItemTypeService', () => {
  let itemTypeService: ItemTypeService;
  let mockItemTypeRepo: jest.Mocked<ItemTypeRepositoryPort>;
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
    mockItemTypeRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ItemTypeRepositoryPort>;

    mockItemCategoryRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ItemCategoryRepositoryPort>;

    itemTypeService = new ItemTypeService(mockItemTypeRepo, mockItemCategoryRepo);
  });

  describe('get', () => {
    it('should return an ItemType when found', () => {
      mockItemTypeRepo.findById.mockReturnValue(mockItemType);

      const result = itemTypeService.get(1);

      expect(result).toEqual(mockItemType);
      expect(mockItemTypeRepo.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when ItemType not found', () => {
      mockItemTypeRepo.findById.mockReturnValue(undefined);

      expect(() => itemTypeService.get(999)).toThrow(NotFoundError);
      expect(() => itemTypeService.get(999)).toThrow('ItemType not found');
    });
  });

  describe('list', () => {
    it('should return all ItemTypes', () => {
      const itemTypes = [mockItemType];
      mockItemTypeRepo.findAll.mockReturnValue(itemTypes);

      const result = itemTypeService.list();

      expect(result).toEqual(itemTypes);
      expect(mockItemTypeRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new ItemType', () => {
      mockItemCategoryRepo.findById.mockReturnValue(mockItemCategory);
      mockItemTypeRepo.insert.mockReturnValue(mockItemType);

      const result = itemTypeService.create(mockItemType);

      expect(mockItemCategoryRepo.findById).toHaveBeenCalledWith('cat-uuid');
      expect(mockItemTypeRepo.insert).toHaveBeenCalledWith(mockItemType);
      expect(result).toEqual(mockItemType);
    });

    it('should throw ValidationError when name is empty', () => {
      const invalidItemType = { ...mockItemType, nom: '' };

      expect(() => itemTypeService.create(invalidItemType)).toThrow(ValidationError);
      expect(() => itemTypeService.create(invalidItemType)).toThrow('ItemType name cannot be empty');
    });

    it('should throw ValidationError when category is invalid', () => {
      const invalidItemType = { ...mockItemType, categorie: { uuid: 'invalid', nom: 'Invalid' } };
      mockItemCategoryRepo.findById.mockReturnValue(undefined);

      expect(() => itemTypeService.create(invalidItemType)).toThrow(ValidationError);
      expect(() => itemTypeService.create(invalidItemType)).toThrow('Invalid category');
    });

    it('should throw ValidationError when categorie is missing', () => {
      const invalidItemType = { ...mockItemType, categorie: undefined as any };

      expect(() => itemTypeService.create(invalidItemType)).toThrow(ValidationError);
    });
  });

  describe('update', () => {
    it('should update an existing ItemType', () => {
      mockItemTypeRepo.findById.mockReturnValue(mockItemType);
      mockItemCategoryRepo.findById.mockReturnValue(mockItemCategory);
      mockItemTypeRepo.update.mockReturnValue(mockItemType);

      const result = itemTypeService.update(1, mockItemType);

      expect(mockItemTypeRepo.findById).toHaveBeenCalledWith(1);
      expect(mockItemCategoryRepo.findById).toHaveBeenCalledWith('cat-uuid');
      expect(mockItemTypeRepo.update).toHaveBeenCalledWith(1, mockItemType);
      expect(result).toEqual(mockItemType);
    });

    it('should throw NotFoundError when ItemType not found', () => {
      mockItemTypeRepo.findById.mockReturnValue(undefined);

      expect(() => itemTypeService.update(999, mockItemType)).toThrow(NotFoundError);
    });

    it('should throw ValidationError when name is empty', () => {
      const invalidItemType = { ...mockItemType, nom: '' };
      mockItemTypeRepo.findById.mockReturnValue(mockItemType);

      expect(() => itemTypeService.update(1, invalidItemType)).toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('should delete an existing ItemType', () => {
      mockItemTypeRepo.findById.mockReturnValue(mockItemType);
      mockItemTypeRepo.delete.mockReturnValue(true);

      const result = itemTypeService.delete(1);

      expect(result).toBe(true);
      expect(mockItemTypeRepo.findById).toHaveBeenCalledWith(1);
      expect(mockItemTypeRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when trying to delete non-existent ItemType', () => {
      mockItemTypeRepo.findById.mockReturnValue(undefined);

      expect(() => itemTypeService.delete(999)).toThrow(NotFoundError);
    });
  });
});