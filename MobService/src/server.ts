import express from 'express';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { initLogPublisher } from './config/logPublisher';
import { MobService } from "./services/MobService";
import { MobController } from "./controllers/MobController";
import { errorHandler } from "./errorHandling";

dotenv.config();

const app = express();
app.use(express.json());

const file = fs.readFileSync(require.resolve('../openapi.yml'), 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const mobService = new MobService();
const mobController = new MobController(mobService);
mobController.registerRoutes(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'mob-service',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

const port = process.env.PORT || 3006;

async function startServer() {
  try {
    await initLogPublisher();
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
