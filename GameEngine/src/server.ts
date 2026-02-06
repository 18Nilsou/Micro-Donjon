import express from 'express';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

import { GameController } from './controllers/GameController';
import { HeroController } from './controllers/HeroController';
import { FightController } from './controllers/FightController';

import { GameService } from './services/GameService';
import { HeroService } from './services/HeroService';
import { FightService } from './services/FightService';

import { errorHandler } from "./errorHandling";
import { connectRedis, redisClient } from "./config/redis";

const app = express();
app.use(express.json());

const file = fs.readFileSync(require.resolve('../openapi.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const gameService = new GameService();
const fightService = new FightService(gameService);
const heroService = new HeroService(gameService, fightService);

const gameController = new GameController(gameService);
const fightController = new FightController(fightService);
const heroController = new HeroController(heroService);

// Register routes
gameController.registerRoutes(app);
fightController.registerRoutes(app);
heroController.registerRoutes(app);

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
