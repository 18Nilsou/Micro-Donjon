import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { store } from "../db/store";
import {
  ItemTypeCreateSchema,
  ItemTypeUpdateSchema,
  type ItemType,
} from "../schemas/types";
import { generateUUID } from "../utils/helpers";
import { z } from "zod";

const itemTypesRouter = new Hono();

// GET /api/items/types - Récupérer tous les types d'items
itemTypesRouter.get("/", async (c) => {
  try {
    const itemTypes = await store.getItemTypes();
    return c.json(itemTypes);
  } catch (error) {
    return c.json({ message: "Erreur serveur", code: 500 }, 500);
  }
});

// POST /api/items/types - Créer un nouveau type d'item
itemTypesRouter.post("/", zValidator("json", ItemTypeCreateSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    
    // Vérifier que la catégorie existe
    const category = await store.getCategoryById(data.categorieUuid);
    if (!category) {
      return c.json({ message: "Catégorie non trouvée", code: 404 }, 404);
    }

    const newItemType: ItemType = {
      uuid: generateUUID(),
      nom: data.nom,
      description: data.description,
      categorie: category,
      effets: data.effets || [],
      rarete: data.rarete || "Commun",
    };

    const saved = await store.saveItemType(newItemType);
    return c.json(saved, 201);
  } catch (error) {
    return c.json({ message: "Erreur serveur", code: 500 }, 500);
  }
});

// GET /api/items/types/:uuid - Récupérer un type d'item par UUID
itemTypesRouter.get("/:uuid", async (c) => {
  try {
    const uuid = c.req.param("uuid");
    const itemType = await store.getItemTypeById(uuid);
    
    if (!itemType) {
      return c.json({ message: "Type d'item non trouvé", code: 404 }, 404);
    }
    
    return c.json(itemType);
  } catch (error) {
    return c.json({ message: "Erreur serveur", code: 500 }, 500);
  }
});

// PUT /api/items/types/:uuid - Mettre à jour un type d'item
itemTypesRouter.put("/:uuid", zValidator("json", ItemTypeUpdateSchema), async (c) => {
  try {
    const uuid = c.req.param("uuid");
    const data = c.req.valid("json");
    
    const existingItemType = await store.getItemTypeById(uuid);
    if (!existingItemType) {
      return c.json({ message: "Type d'item non trouvé", code: 404 }, 404);
    }

    let category = existingItemType.categorie;
    
    // Si une nouvelle catégorie est spécifiée, la récupérer
    if (data.categorieUuid) {
      const newCategory = await store.getCategoryById(data.categorieUuid);
      if (!newCategory) {
        return c.json({ message: "Catégorie non trouvée", code: 404 }, 404);
      }
      category = newCategory;
    }

    const updatedItemType: ItemType = {
      ...existingItemType,
      nom: data.nom ?? existingItemType.nom,
      description: data.description ?? existingItemType.description,
      categorie: category,
      effets: data.effets ?? existingItemType.effets,
      rarete: data.rarete ?? existingItemType.rarete,
    };

    const saved = await store.saveItemType(updatedItemType);
    return c.json(saved);
  } catch (error) {
    return c.json({ message: "Erreur serveur", code: 500 }, 500);
  }
});

// DELETE /api/items/types/:uuid - Supprimer un type d'item
itemTypesRouter.delete("/:uuid", async (c) => {
  try {
    const uuid = c.req.param("uuid");
    const deleted = await store.deleteItemType(uuid);
    
    if (!deleted) {
      return c.json({ message: "Type d'item non trouvé", code: 404 }, 404);
    }
    
    return c.body(null, 204);
  } catch (error) {
    return c.json({ message: "Erreur serveur", code: 500 }, 500);
  }
});

export default itemTypesRouter;
