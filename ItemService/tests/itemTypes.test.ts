import { describe, it, expect, beforeEach } from "bun:test";
import { Hono } from "hono";
import itemTypesRouter from "../src/routes/itemTypes";
import { store } from "../src/db/store";
import type { ItemCategory } from "../src/schemas/types";
import { randomUUID } from "crypto";

describe("Item Types Routes", () => {
  let app: Hono;
  let testCategory: ItemCategory;

  beforeEach(async () => {
    // Créer une catégorie de test
    testCategory = { uuid: randomUUID(), nom: "Arme Test" };
    const categories = await store.getCategories();
    categories.push(testCategory);
    await store.saveCategories(categories);

    // Configurer l'app de test
    app = new Hono();
    app.route("/api/items/types", itemTypesRouter);
  });

  describe("GET /api/items/types", () => {
    it("devrait retourner une liste de types d'items", async () => {
      const res = await app.request("/api/items/types");
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("devrait retourner un tableau vide si aucun type n'existe", async () => {
      // Vider les types d'items
      const itemTypes = await store.getItemTypes();
      for (const type of itemTypes) {
        await store.deleteItemType(type.uuid);
      }

      const res = await app.request("/api/items/types");
      const data = await res.json();
      
      expect(data).toEqual([]);
    });
  });

  describe("POST /api/items/types", () => {
    it("devrait créer un nouveau type d'item", async () => {
      const newItemType = {
        nom: "Épée de Test",
        description: "Une épée pour les tests",
        categorieUuid: testCategory.uuid,
        effets: [{ caracteristique: "Force", valeur: 15 }],
        rarete: "Rare",
      };

      const res = await app.request("/api/items/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemType),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.nom).toBe("Épée de Test");
      expect(data.uuid).toBeDefined();
      expect(data.categorie.nom).toBe("Arme Test");
      expect(data.effets).toHaveLength(1);
    });

    it("devrait utiliser la rareté par défaut 'Commun'", async () => {
      const newItemType = {
        nom: "Item Simple",
        categorieUuid: testCategory.uuid,
      };

      const res = await app.request("/api/items/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemType),
      });

      const data = await res.json();
      expect(data.rarete).toBe("Commun");
    });

    it("devrait retourner 404 si la catégorie n'existe pas", async () => {
      const newItemType = {
        nom: "Épée de Test",
        categorieUuid: randomUUID(),
      };

      const res = await app.request("/api/items/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemType),
      });

      expect(res.status).toBe(404);
      
      const data = await res.json();
      expect(data.message).toContain("Catégorie non trouvée");
    });

    it("devrait retourner 400 pour des données invalides", async () => {
      const invalidData = {
        // Manque le champ 'nom' requis
        categorieUuid: testCategory.uuid,
      };

      const res = await app.request("/api/items/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/items/types/:uuid", () => {
    it("devrait récupérer un type d'item par UUID", async () => {
      // Créer un type d'item
      const newItemType = {
        nom: "Épée de Test",
        categorieUuid: testCategory.uuid,
        rarete: "Rare",
      };

      const createRes = await app.request("/api/items/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemType),
      });

      const created = await createRes.json();

      // Récupérer le type d'item créé
      const res = await app.request(`/api/items/types/${created.uuid}`);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.uuid).toBe(created.uuid);
      expect(data.nom).toBe("Épée de Test");
    });

    it("devrait retourner 404 pour un UUID inexistant", async () => {
      const res = await app.request(`/api/items/types/${randomUUID()}`);
      
      expect(res.status).toBe(404);
      
      const data = await res.json();
      expect(data.message).toContain("Type d'item non trouvé");
    });
  });

  describe("PUT /api/items/types/:uuid", () => {
    it("devrait mettre à jour un type d'item", async () => {
      // Créer un type d'item
      const newItemType = {
        nom: "Épée de Test",
        categorieUuid: testCategory.uuid,
        rarete: "Commun",
      };

      const createRes = await app.request("/api/items/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemType),
      });

      const created = await createRes.json();

      // Mettre à jour
      const updates = {
        nom: "Épée Améliorée",
        rarete: "Legendaire",
      };

      const res = await app.request(`/api/items/types/${created.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.nom).toBe("Épée Améliorée");
      expect(data.rarete).toBe("Legendaire");
    });

    it("devrait retourner 404 pour un UUID inexistant", async () => {
      const res = await app.request(`/api/items/types/${randomUUID()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: "Test" }),
      });

      expect(res.status).toBe(404);
    });

    it("devrait permettre de changer la catégorie", async () => {
      // Créer une deuxième catégorie
      const category2: ItemCategory = { uuid: randomUUID(), nom: "Armure Test" };
      const categories = await store.getCategories();
      categories.push(category2);
      await store.saveCategories(categories);

      // Créer un type d'item
      const newItemType = {
        nom: "Item Test",
        categorieUuid: testCategory.uuid,
      };

      const createRes = await app.request("/api/items/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemType),
      });

      const created = await createRes.json();

      // Changer la catégorie
      const res = await app.request(`/api/items/types/${created.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorieUuid: category2.uuid }),
      });

      const data = await res.json();
      expect(data.categorie.nom).toBe("Armure Test");
    });
  });

  describe("DELETE /api/items/types/:uuid", () => {
    it("devrait supprimer un type d'item", async () => {
      // Créer un type d'item
      const newItemType = {
        nom: "Épée de Test",
        categorieUuid: testCategory.uuid,
      };

      const createRes = await app.request("/api/items/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemType),
      });

      const created = await createRes.json();

      // Supprimer
      const res = await app.request(`/api/items/types/${created.uuid}`, {
        method: "DELETE",
      });

      expect(res.status).toBe(204);

      // Vérifier que l'item n'existe plus
      const getRes = await app.request(`/api/items/types/${created.uuid}`);
      expect(getRes.status).toBe(404);
    });

    it("devrait retourner 404 pour un UUID inexistant", async () => {
      const res = await app.request(`/api/items/types/${randomUUID()}`, {
        method: "DELETE",
      });

      expect(res.status).toBe(404);
    });
  });
});
