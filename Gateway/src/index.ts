import express from 'express';
import cors from 'cors';
import fs from 'fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { SERVICES } from './config/services';
import gameEngineRoutes from './routes/gameEngine.routes';
import heroRoutes from './routes/hero.routes';
import dungeonRoutes from './routes/dungeon.routes';
import mobRoutes from './routes/mob.routes';
import itemRoutes from './routes/item.routes';
import logRoutes from './routes/log.routes';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load OpenAPI documentation
const file = fs.readFileSync('./openapi.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth routes (public, before auth middleware)
app.use('/api', authRoutes);

// Protected routes (require JWT)
app.use('/api', authMiddleware);
app.use('/api', gameEngineRoutes);
app.use('/api', heroRoutes);
app.use('/api', dungeonRoutes);
app.use('/api', mobRoutes);
app.use('/api', itemRoutes);
app.use('/api', logRoutes);
app.use('/', healthRoutes);

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
