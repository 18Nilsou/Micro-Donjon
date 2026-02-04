import express from 'express';
import path from 'path';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

import { GameController } from './controllers/GameController';
import { HeroController } from './controllers/HeroController';
import { FightController } from './controllers/FightController';
import { DungeonController } from './controllers/DungeonController';
import { MobController } from './controllers/MobController';
import { ItemController } from './controllers/ItemController';

import { GameService } from './services/GameService';
import { HeroService } from './services/HeroService';
import { DungeonService } from './services/DungeonService';
import { FightService } from './services/FightService';
import { MobService } from './services/MobService';
import { ItemService } from './services/ItemService';

import { errorHandler } from "./errorHandling";
import { connectRedis, redisClient } from "./config/redis";

const app = express();
app.use(express.json());

const file = fs.readFileSync(require.resolve('../openapi.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const dungeonService = new DungeonService();
const mobService = new MobService();
const itemService = new ItemService();
const gameService = new GameService();
const fightService = new FightService(gameService);
const heroService = new HeroService(gameService, fightService);

const gameController = new GameController(gameService);
const heroController = new HeroController(heroService);
const fightController = new FightController(fightService);
const dungeonController = new DungeonController(dungeonService);
const mobController = new MobController(mobService);
const itemController = new ItemController(itemService);

// Register routes
gameController.registerRoutes(app);
heroController.registerRoutes(app);
fightController.registerRoutes(app);
dungeonController.registerRoutes(app);
mobController.registerRoutes(app);
itemController.registerRoutes(app);

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'game-engine',
    timestamp: new Date().toISOString(),
    redis_connected: redisClient?.isOpen || false
  };

  if (!redisClient?.isOpen) {
    health.status = 'degraded';
    return res.status(503).json(health);
  }

  res.status(200).json(health);
});

app.use(errorHandler);

const port = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectRedis();

    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
      console.log(`Swagger docs at http://localhost:${port}/docs`);
      console.log(`Health check at http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
