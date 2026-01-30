import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import fs from 'fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load OpenAPI documentation
const file = fs.readFileSync('./openapi.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Service URLs configuration
interface Services {
  GAME_ENGINE: string;
  HERO: string;
  DUNGEON: string;
  ITEM: string;
  MOB: string;
  LOG: string;
}

const SERVICES: Services = {
  GAME_ENGINE: process.env.GAME_ENGINE_URL || 'http://game-engine:3001',
  HERO: process.env.HERO_SERVICE_URL || 'http://hero-service:3002',
  DUNGEON: process.env.DUNGEON_SERVICE_URL || 'http://dungeon-service:3003',
  ITEM: process.env.ITEM_SERVICE_URL || 'http://item-service:3004',
  MOB: process.env.MOB_SERVICE_URL || 'http://mob-service:3006',
  LOG: process.env.LOG_SERVICE_URL || 'http://log-service:3005',
};

// Error handler middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Gateway Error:', err.message);

  if (err.response) {
    // Error from downstream service
    res.status(err.response.status).json({
      error:
        err.response.data.error || err.response.data.message || 'Service error',
      service: err.config?.baseURL,
    });
  } else if (err.code === 'ECONNREFUSED') {
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Unable to connect to downstream service',
    });
  } else {
    res.status(500).json({
      error: 'Internal gateway error',
      message: err.message,
    });
  }
};

// Proxy function
const proxyRequest = async (req: Request, res: Response, serviceUrl: string, path: string): Promise<void> => {
  try {
    const config: AxiosRequestConfig = {
      method: req.method,
      url: `${serviceUrl}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      data: req.body,
      params: req.query,
    };

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    throw error;
  }
};

// ==================== GAME ENGINE ROUTES ====================
// Game routes
app.post('/api/game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game');
  } catch (error) {
    next(error);
  }
});

app.get('/api/game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game');
  } catch (error) {
    next(error);
  }
});

app.put('/api/game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game');
  } catch (error) {
    next(error);
  }
});

app.delete('/api/game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game');
  } catch (error) {
    next(error);
  }
});

app.post('/api/game/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/game/start');
  } catch (error) {
    next(error);
  }
});

// Hero routes (via Game Engine)
app.put('/api/hero/:heroId/move', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/hero/${req.params.heroId}/move`,
    );
  } catch (error) {
    next(error);
  }
});

// Fight routes
app.post('/api/fight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/fight');
  } catch (error) {
    next(error);
  }
});

app.get('/api/fight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/fight');
  } catch (error) {
    next(error);
  }
});

app.put('/api/fight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/fight');
  } catch (error) {
    next(error);
  }
});

app.delete('/api/fight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/fight');
  } catch (error) {
    next(error);
  }
});

// Dungeon routes (via Game Engine)
app.post('/api/dungeon', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/dungeon');
  } catch (error) {
    next(error);
  }
});

app.get('/api/dungeon', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/dungeon');
  } catch (error) {
    next(error);
  }
});

// Mob routes (via Game Engine)
app.get('/api/mob/:mobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/mob/${req.params.mobId}`,
    );
  } catch (error) {
    next(error);
  }
});

app.put('/api/mob/:mobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/mob/${req.params.mobId}`,
    );
  } catch (error) {
    next(error);
  }
});

app.delete('/api/mob/:mobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/mob/${req.params.mobId}`,
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/mob', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/mob');
  } catch (error) {
    next(error);
  }
});

app.post('/api/mob', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/mob');
  } catch (error) {
    next(error);
  }
});

app.delete('/api/mob', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/mob');
  } catch (error) {
    next(error);
  }
});

// Item routes (via Game Engine)
app.get('/api/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.GAME_ENGINE, '/items');
  } catch (error) {
    next(error);
  }
});

app.get('/api/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.GAME_ENGINE,
      `/items/${req.params.itemId}`,
    );
  } catch (error) {
    next(error);
  }
});

// ==================== DIRECT SERVICE ROUTES ====================
// Hero Service direct routes
app.get('/api/heroes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, '/heroes');
  } catch (error) {
    next(error);
  }
});

app.get('/api/heroes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, `/heroes/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

app.post('/api/heroes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.HERO, '/heroes');
  } catch (error) {
    next(error);
  }
});

app.put('/api/heroes/:id/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/health`,
    );
  } catch (error) {
    next(error);
  }
});

app.put('/api/heroes/:id/health-max', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/health-max`,
    );
  } catch (error) {
    next(error);
  }
});

app.put('/api/heroes/:id/level', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/level`,
    );
  } catch (error) {
    next(error);
  }
});

app.put('/api/heroes/:id/attack', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/attack`,
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/heroes/:id/inventory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/inventory`,
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/heroes/:id/inventory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.HERO,
      `/heroes/${req.params.id}/inventory`,
    );
  } catch (error) {
    next(error);
  }
});

// Dungeon Service direct routes
app.get('/api/dungeons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.DUNGEON, '/dungeons');
  } catch (error) {
    next(error);
  }
});

app.get('/api/dungeons/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.DUNGEON,
      `/dungeons/${req.params.id}`,
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/dungeons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.DUNGEON, '/dungeons');
  } catch (error) {
    next(error);
  }
});

// Mob Service direct routes
app.get('/api/mobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.MOB, '/mobs');
  } catch (error) {
    next(error);
  }
});

app.get('/api/mobs/:type', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.MOB, `/mobs/${req.params.type}`);
  } catch (error) {
    next(error);
  }
});

// Item Service direct routes
app.get('/api/item-categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.ITEM, '/item-categories');
  } catch (error) {
    next(error);
  }
});

// Log Service routes
app.get('/api/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.LOG, '/logs');
  } catch (error) {
    next(error);
  }
});

app.get('/api/logs/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(req, res, SERVICES.LOG, '/logs/stats');
  } catch (error) {
    next(error);
  }
});

app.get('/api/logs/:service/:entityId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proxyRequest(
      req,
      res,
      SERVICES.LOG,
      `/logs/${req.params.service}/${req.params.entityId}`,
    );
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const healthChecks: Record<string, string> = {};

  for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
    try {
      await axios.get(`${serviceUrl}/health`, { timeout: 2000 });
      healthChecks[serviceName] = 'healthy';
    } catch (error) {
      healthChecks[serviceName] = 'unhealthy';
    }
  }

  const allHealthy = Object.values(healthChecks).every(
    (status) => status === 'healthy',
  );

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: healthChecks,
  });
});

// Apply error handler
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gateway listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
  console.log('Service URLs:');
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
});
