import { describe, it, expect, beforeEach } from "bun:test";
import { Hono } from "hono";
import itemsRouter from "../src/routes/items";
import { store } from "../src/db/store";
import type { ItemCategory, ItemType } from "../src/schemas/types";
import { randomUUID } from "crypto";

describe("Items Routes", () => {
  let app: Hono;
  let testItemType1: ItemType;
  let testItemType2: ItemType;
  let testCategory: ItemCategory;

  beforeEach(async () => {
    // Créer une catégorie de test
    testCategory = { uuid: randomUUID(), nom: "Arme Test" };
    const categories = await store.getCategories();
    categories.push(testCategory);
    await store.saveCategories(categories);

    // Créer des types d'items de test
    testItemType1 = {
      uuid: randomUUID(),
      nom: "Épée Commune",
      description: "Une épée basique",
      categorie: testCategory,
      effets: [{ caracteristique: "Force", valeur: 5 }],
      rarete: "Commun",
    };

    testItemType2 = {
      uuid: randomUUID(),
      nom: "Épée Rare",
      description: "Une épée puissante",
      categorie: testCategory,
      effets: [{ caracteristique: "Force", valeur: 15 }],
      rarete: "Rare",
    };

    await store.saveItemType(testItemType1);
    await store.saveItemType(testItemType2);

    // Configurer l'app de test
    app = new Hono();
    app.route("/api/items", itemsRouter);
  });

  describe("GET /api/items", () => {
    it("devrait retourner une liste d'items", async () => {
      const res = await app.request("/api/items");
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("devrait retourner un tableau vide si aucun item n'existe", async () => {
      // Vider les items
      const items = await store.getItems();
      for (const item of items) {
        await store.deleteItem(item.uuid);
      }

      const res = await app.request("/api/items");
      const data = await res.json();
      
      expect(data).toEqual([]);
    });
  });

  describe("GET /api/items/:uuid", () => {
    it("devrait récupérer un item par UUID", async () => {
      // Générer un item
      const generateRes = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemTypeUuid: testItemType1.uuid }),
      });

      const generated = await generateRes.json();

      // Récupérer l'item généré
      const res = await app.request(`/api/items/${generated.uuid}`);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.uuid).toBe(generated.uuid);
      expect(data.itemType.nom).toBe("Épée Commune");
    });

    it("devrait retourner 404 pour un UUID inexistant", async () => {
      const res = await app.request(`/api/items/${randomUUID()}`);
      
      expect(res.status).toBe(404);
      
      const data = await res.json();
      expect(data.message).toContain("Item non trouvé");
    });
  });

  describe("POST /api/items/generate", () => {
    it("devrait générer un item à partir d'un type spécifique", async () => {
      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemTypeUuid: testItemType1.uuid,
        }),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.uuid).toBeDefined();
      expect(data.itemType.nom).toBe("Épée Commune");
      expect(data.itemType.uuid).toBe(testItemType1.uuid);
    });

    it("devrait générer un item avec position et roomId", async () => {
      const position = { x: 10.5, y: 20.3 };
      const roomId = randomUUID();

      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemTypeUuid: testItemType1.uuid,
          position,
          roomId,
        }),
      });

      const data = await res.json();
      expect(data.position).toEqual(position);
      expect(data.roomId).toBe(roomId);
    });

    it("devrait générer un item d'une rareté spécifique", async () => {
      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rarity: "Rare",
        }),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.rarete).toBe("Rare");
      expect(data.itemType.rarete).toBe("Rare");
      expect(data.itemType.nom).toBeDefined();
      expect(data.uuid).toBeDefined();
    });

    it("devrait générer un item complètement aléatoire", async () => {
      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.uuid).toBeDefined();
      expect(data.itemType).toBeDefined();
      expect(data.itemType.nom).toBeTruthy();
    });

    it("devrait retourner 404 si le type d'item n'existe pas", async () => {
      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemTypeUuid: randomUUID(),
        }),
      });

      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.message).toContain("Type d'item non trouvé");
    });

    it("devrait retourner 400 si aucun type n'existe pour la rareté", async () => {
      // Supprimer tous les types "Epic"
      const itemTypes = await store.getItemTypes();
      for (const type of itemTypes) {
        if (type.rarete === "Epic") {
          await store.deleteItemType(type.uuid);
        }
      }

      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rarity: "Epic",
        }),
      });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.message).toContain("Aucun type d'item disponible");
    });

    it("devrait retourner 400 si aucun type d'item n'existe", async () => {
      // Supprimer tous les types d'items
      const itemTypes = await store.getItemTypes();
      for (const type of itemTypes) {
        await store.deleteItemType(type.uuid);
      }

      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.message).toContain("Aucun type d'item disponible");
    });

    it("devrait utiliser la rareté du type si non spécifiée", async () => {
      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemTypeUuid: testItemType1.uuid,
        }),
      });

      const data = await res.json();
      expect(data.rarete).toBe(testItemType1.rarete);
    });

    it("devrait permettre de surcharger la rareté du type", async () => {
      const res = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemTypeUuid: testItemType1.uuid,
          rarity: "Legendaire",
        }),
      });

      const data = await res.json();
      expect(data.rarete).toBe("Legendaire");
      expect(data.itemType.rarete).toBe("Commun"); // Le type garde sa rareté
    });
  });

  describe("Items persistence", () => {
    it("devrait sauvegarder les items générés", async () => {
      // Générer plusieurs items
      await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemTypeUuid: testItemType1.uuid }),
      });

      await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemTypeUuid: testItemType2.uuid }),
      });

      // Récupérer tous les items
      const res = await app.request("/api/items");
      const data = await res.json();

      expect(data.length).toBeGreaterThanOrEqual(2);
    });

    it("devrait persister les items entre les requêtes", async () => {
      const generateRes = await app.request("/api/items/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemTypeUuid: testItemType1.uuid }),
      });

      const generated = await generateRes.json();

      // Nouvelle requête pour récupérer l'item
      const getRes = await app.request(`/api/items/${generated.uuid}`);
      const retrieved = await getRes.json();

      expect(retrieved.uuid).toBe(generated.uuid);
      expect(retrieved.itemType.nom).toBe(generated.itemType.nom);
    });
  });
});
