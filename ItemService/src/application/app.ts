import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import path from 'path';

import { ItemCategoryRepositoryAdapter } from "../infrastructure/adapters/itemCategoryRepositoryAdapter";
import { ItemTypeRepositoryAdapter } from "../infrastructure/adapters/itemTypeRepositoryAdapter";
import { ItemRepositoryAdapter } from "../infrastructure/adapters/itemRepositoryAdapter";
import { ItemTypeService } from "../domain/services/ItemTypeService";
import { ItemService } from "../domain/services/ItemService";
import { ItemTypeController } from "../presentation/controllers/itemTypeController";
import { ItemController } from "../presentation/controllers/itemController";
import { errorHandler } from "./errorHandling";

const app = express();
app.use(express.json());

// --- Swagger ---
try {
    const file = fs.readFileSync(path.resolve(__dirname, '../../openapi.yml'), 'utf8');
    const swaggerDocument = YAML.parse(file);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
    console.warn("Swagger file not found or invalid");
}

const itemCategoryRepo = new ItemCategoryRepositoryAdapter();
// Initialize with default categories if empty
if (itemCategoryRepo.findAll().length === 0) {
  itemCategoryRepo.insert({ uuid: '550e8400-e29b-41d4-a716-446655440000', nom: 'Arme' });
  itemCategoryRepo.insert({ uuid: '550e8400-e29b-41d4-a716-446655440001', nom: 'Armure' });
  itemCategoryRepo.insert({ uuid: '550e8400-e29b-41d4-a716-446655440002', nom: 'Potion' });
}

const itemTypeRepo = new ItemTypeRepositoryAdapter();
const itemRepo = new ItemRepositoryAdapter();

const itemTypeService = new ItemTypeService(itemTypeRepo, itemCategoryRepo);
const itemService = new ItemService(itemRepo, itemTypeRepo);

const itemTypeController = new ItemTypeController(itemTypeService, itemCategoryRepo);
const itemController = new ItemController(itemService);

itemTypeController.registerRoutes(app);
itemController.registerRoutes(app);

app.use(errorHandler);

export { app };