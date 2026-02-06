import express from 'express';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { DungeonService } from "./services/DungeonService";
import { DungeonController } from "./controllers/DungeonController";
import { errorHandler } from "./errorHandling";
import { connectRedis, redisClient } from "./config/redis";

dotenv.config();

const app = express();
app.use(express.json());

const file = fs.readFileSync(require.resolve('../openapi.yml'), 'utf8');
const swaggerDocument = YAML.parse(file);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const dungeonService = new DungeonService();
const dungeonController = new DungeonController(dungeonService);
dungeonController.registerRoutes(app);

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'dungeon-service',
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

const port = process.env.PORT || 3003;

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
