import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'node:fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { AuthController } from './controllers/AuthController';
import { AuthService } from './services/AuthService';
import { initDatabase } from './config/database';
import { errorHandler } from './errorHandling';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load OpenAPI documentation
const file = fs.readFileSync('./openapi.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authService = new AuthService();
const authController = new AuthController(authService);
authController.registerRoutes(app);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

const port = process.env.PORT || 3007;

async function startServer() {
  try {
    await initDatabase();
    app.listen(port, () => {
      console.log(`Auth Service listening on http://localhost:${port}`);
      console.log(`Swagger docs at http://localhost:${port}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
