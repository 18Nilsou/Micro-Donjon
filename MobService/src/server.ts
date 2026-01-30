import express from 'express';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { MobService } from "./services/MobService";
import { MobController } from "./controllers/MobController";
import { errorHandler } from "./errorHandling";

dotenv.config();

const app = express();
app.use(express.json());

const file = fs.readFileSync(require.resolve('./api/mob.yml'), 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const mobService = new MobService();
const mobController = new MobController(mobService);
mobController.registerRoutes(app);

app.use(errorHandler);

const port = process.env.PORT || 3006;

async function startServer() {
  try {
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