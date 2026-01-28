import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { swaggerUI } from "@hono/swagger-ui";
import itemTypesRouter from "./routes/itemTypes";
import itemsRouter from "./routes/items";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());

// Swagger UI
app.get("/docs", swaggerUI({ url: "/openapi.yml" }));

// Servir le fichier OpenAPI
app.get("/openapi.yml", async (c) => {
  const file = Bun.file("./openapi.yml");
  const content = await file.text();
  return c.text(content, 200, {
    "Content-Type": "application/x-yaml",
  });
});

// Routes de santé
app.get("/", (c) => {
  return c.json({
    service: "Item Service",
    version: "1.0.0",
    status: "running",
    documentation: "/docs",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Routes API
app.route("/api/items/types", itemTypesRouter);
app.route("/api/items", itemsRouter);

// Gestion des erreurs 404
app.notFound((c) => {
  return c.json({ message: "Route non trouvée", code: 404 }, 404);
});

// Démarrage du serveur
const port = process.env.PORT || 3004;

console.log(`🚀 Item Service démarré sur http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
