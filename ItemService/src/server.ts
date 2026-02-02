import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { init } from './config/dataBase';
import { ItemService } from './services/ItemService';
import { ItemController } from './controllers/ItemController';
import { HTTPError } from './domains/errors/HTTPError';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HTTPError) {
    res.status(err.code).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    await init();
    console.log('Database initialized successfully');

    const itemService = new ItemService();

    const itemController = new ItemController(itemService);

    itemController.registerRoutes(app);

    app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'OK' });
    });

    app.listen(PORT, () => {
      console.log(`ItemService running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
