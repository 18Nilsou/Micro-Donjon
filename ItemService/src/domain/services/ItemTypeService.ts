import { ItemTypeServicePort } from '../../application/ports/inbound/ItemTypeServicePort';
import { ItemType } from '../models/ItemType';
import { ItemTypeRepositoryPort } from '../../application/ports/outbound/ItemTypeRepositoryPort';
import { ItemCategoryRepositoryPort } from '../../application/ports/outbound/ItemCategoryRepositoryPort';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';

export class ItemTypeService implements ItemTypeServicePort {
  constructor(
    private readonly itemTypeRepo: ItemTypeRepositoryPort,
    private readonly itemCategoryRepo: ItemCategoryRepositoryPort
  ) {}

  get(id: number): ItemType {
    const itemType = this.itemTypeRepo.findById(id);
    if (!itemType) {
      throw new NotFoundError('ItemType not found');
    }
    return itemType;
  }

  list(): ItemType[] {
    return this.itemTypeRepo.findAll();
  }

  create(itemType: ItemType): ItemType {
    if (!itemType.nom) {
      throw new ValidationError('ItemType name cannot be empty');
    }
    if (!itemType.categorie || !this.itemCategoryRepo.findById(itemType.categorie.uuid)) {
      throw new ValidationError('Invalid category');
    }
    return this.itemTypeRepo.insert(itemType);
  }

  update(id: number, itemType: ItemType): ItemType {
    this.get(id);
    if (!itemType.nom) {
      throw new ValidationError('ItemType name cannot be empty');
    }
    if (!itemType.categorie || !this.itemCategoryRepo.findById(itemType.categorie.uuid)) {
      throw new ValidationError('Invalid category');
    }
    return this.itemTypeRepo.update(id, itemType);
  }

  delete(id: number): boolean {
    this.get(id);
    return this.itemTypeRepo.delete(id);
  }
}