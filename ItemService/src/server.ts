import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { ItemService } from './services/ItemService';
import { ItemController } from './controllers/ItemController';
import { HTTPError } from './domains/errors/HTTPError';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

const file = fs.readFileSync(require.resolve('../openapi.yml'), 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HTTPError) {
    res.status(err.code).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const startServer = async () => {
  try {
    console.log('Starting ItemService with JSON file storage...');

    const itemService = new ItemService();

    const itemController = new ItemController(itemService);

    itemController.registerRoutes(app);

    app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'OK' });
    });

    app.listen(PORT, () => {
      console.log(`ItemService running on port ${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
