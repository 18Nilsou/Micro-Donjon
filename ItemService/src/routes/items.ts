import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { store } from "../db/store";
import { ItemGenerateSchema, type Item, type Rarity } from "../schemas/types";
import { generateUUID, randomElement } from "../utils/helpers";

const itemsRouter = new Hono();

// GET /api/items - Liste tous les items générés
itemsRouter.get("/", async (c) => {
  try {
    const items = await store.getItems();
    return c.json(items);
  } catch (error) {
    return c.json({ message: "Erreur serveur", code: 500 }, 500);
  }
});

// GET /api/items/:uuid - Récupère un item par son UUID
itemsRouter.get("/:uuid", async (c) => {
  try {
    const uuid = c.req.param("uuid");
    const item = await store.getItemById(uuid);
    
    if (!item) {
      return c.json({ message: "Item non trouvé", code: 404 }, 404);
    }
    
    return c.json(item);
  } catch (error) {
    return c.json({ message: "Erreur serveur", code: 500 }, 500);
  }
});

// POST /api/items/generate - Générer un item aléatoire
itemsRouter.post("/generate", zValidator("json", ItemGenerateSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    
    let itemType;
    
    // Si un itemTypeUuid est fourni, l'utiliser
    if (data.itemTypeUuid) {
      itemType = await store.getItemTypeById(data.itemTypeUuid);
      if (!itemType) {
        return c.json({ message: "Type d'item non trouvé", code: 404 }, 404);
      }
    } else {
      // Sinon, sélectionner un type aléatoire
      const allItemTypes = await store.getItemTypes();
      
      if (allItemTypes.length === 0) {
        return c.json({ 
          message: "Aucun type d'item disponible pour la génération", 
          code: 400 
        }, 400);
      }
      
      // Filtrer par rareté si spécifiée
      let filteredTypes = allItemTypes;
      if (data.rarity) {
        filteredTypes = allItemTypes.filter((type) => type.rarete === data.rarity);
        
        if (filteredTypes.length === 0) {
          return c.json({ 
            message: `Aucun type d'item disponible pour la rareté ${data.rarity}`, 
            code: 400 
          }, 400);
        }
      }
      
      itemType = randomElement(filteredTypes);
    }

    // Créer l'item généré
    const newItem: Item = {
      uuid: generateUUID(),
      itemType: itemType,
      position: data.position,
      roomId: data.roomId,
      rarete: data.rarity || itemType.rarete,
    };

    const saved = await store.saveItem(newItem);
    return c.json(saved, 201);
  } catch (error) {
    console.error("Error generating item:", error);
    return c.json({ message: "Erreur serveur", code: 500 }, 500);
  }
});

export default itemsRouter;
