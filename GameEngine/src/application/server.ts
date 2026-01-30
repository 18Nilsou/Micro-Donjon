import express from 'express';
import path from 'path';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

import { GameRepositoryAdapter } from "../infrastructure/adapters/GameRepositoryAdapter";
import { DungeonServiceAdapter } from "../infrastructure/adapters/DungeonServiceAdapter";
import { MobServiceAdapter } from "../infrastructure/adapters/MobServiceAdapter";
import { ItemServiceAdapter } from "../infrastructure/adapters/ItemServiceAdapter";
import { HeroServiceAdapter } from "../infrastructure/adapters/HeroServiceAdapter";
import { MessageBrokerAdapter } from "../infrastructure/adapters/MessageBrokerAdapter";

import { GameService } from "../domain/services/GameService";
import { HeroService } from "../domain/services/HeroService";
import { FightService } from "../domain/services/FightService";
import { DungeonService } from "../domain/services/DungeonService";
import { MobService } from "../domain/services/MobService";
import { ItemService } from "../domain/services/ItemService";

import { GameController } from "../presentation/controllers/GameController";
import { HeroController } from "../presentation/controllers/HeroController";
import { FightController } from "../presentation/controllers/FightController";
import { DungeonController } from "../presentation/controllers/DungeonController";
import { MobController } from "../presentation/controllers/MobController";
import { ItemController } from "../presentation/controllers/ItemController";

import { errorHandler } from "./errorHandling";
import { connectRedis, redisClient } from "../config/redis";

const app = express();
app.use(express.json());

const file = fs.readFileSync(require.resolve('../../openapi.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Adapters
const gameRepo = new GameRepositoryAdapter();
const dungeonServiceAdapter = new DungeonServiceAdapter();
const mobServiceAdapter = new MobServiceAdapter();
const itemServiceAdapter = new ItemServiceAdapter();
const heroServiceAdapter = new HeroServiceAdapter();
const messageBroker = new MessageBrokerAdapter();

// Services
const gameService = new GameService(gameRepo, heroServiceAdapter, dungeonServiceAdapter, messageBroker);
const heroService = new HeroService(gameRepo, heroServiceAdapter, messageBroker);
const fightService = new FightService(gameRepo, messageBroker);
const dungeonService = new DungeonService(dungeonServiceAdapter);
const mobService = new MobService(mobServiceAdapter);
const itemService = new ItemService(itemServiceAdapter);

// Controllers
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
