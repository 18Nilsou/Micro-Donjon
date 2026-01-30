import express from 'express';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { HeroService } from "./services/HeroService";
import { HeroController } from "./controllers/HeroController";
import { errorHandler } from "./errorHandling";
import { connectRedis } from './config/redis';
import { initLogPublisher } from './config/logPublisher';

dotenv.config();

const app = express();
app.use(express.json());

const file = fs.readFileSync(require.resolve('./api/hero.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const heroService = new HeroService();
const heroController = new HeroController(heroService);
heroController.registerRoutes(app);

app.use(errorHandler);

const port = process.env.PORT || 3002;

async function startServer() {
  try {
    await connectRedis();
    await initLogPublisher();
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
      console.log(`Swagger docs at http://localhost:${port}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
