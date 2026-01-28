import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { JsonStore } from "../src/db/store";
import type { ItemCategory, ItemType, Item } from "../src/schemas/types";
import { randomUUID } from "crypto";
import { unlinkSync, existsSync } from "fs";

describe("JsonStore", () => {
  let store: JsonStore;
  const testDataDir = "./test-data";
  
  // Créer une instance de store pour les tests avec un répertoire dédié
  class TestJsonStore extends JsonStore {
    constructor() {
      super();
      (this as any).categoriesPath = `${testDataDir}/categories.json`;
      (this as any).itemTypesPath = `${testDataDir}/item-types.json`;
      (this as any).itemsPath = `${testDataDir}/items.json`;
    }
    
    protected ensureDataDirectory() {
      const fs = require("fs");
      if (!fs.existsSync(testDataDir)) {
        fs.mkdirSync(testDataDir, { recursive: true });
      }
    }
  }

  beforeEach(() => {
    store = new TestJsonStore();
  });

  afterEach(() => {
    // Nettoyer les fichiers de test
    try {
      if (existsSync(`${testDataDir}/categories.json`)) unlinkSync(`${testDataDir}/categories.json`);
      if (existsSync(`${testDataDir}/item-types.json`)) unlinkSync(`${testDataDir}/item-types.json`);
      if (existsSync(`${testDataDir}/items.json`)) unlinkSync(`${testDataDir}/items.json`);
      if (existsSync(testDataDir)) require("fs").rmdirSync(testDataDir);
    } catch (error) {
      // Ignorer les erreurs de nettoyage
    }
  });

  describe("Categories", () => {
    it("devrait créer et récupérer des catégories", async () => {
      const categories: ItemCategory[] = [
        { uuid: randomUUID(), nom: "Arme" },
        { uuid: randomUUID(), nom: "Armure" },
      ];

      await store.saveCategories(categories);
      const retrieved = await store.getCategories();

      expect(retrieved).toHaveLength(2);
      expect(retrieved[0].nom).toBe("Arme");
      expect(retrieved[1].nom).toBe("Armure");
    });

    it("devrait récupérer une catégorie par UUID", async () => {
      const categories: ItemCategory[] = [
        { uuid: randomUUID(), nom: "Arme" },
        { uuid: randomUUID(), nom: "Armure" },
      ];

      await store.saveCategories(categories);
      const category = await store.getCategoryById(categories[0].uuid);

      expect(category).toBeDefined();
      expect(category?.nom).toBe("Arme");
    });

    it("devrait retourner undefined pour une catégorie inexistante", async () => {
      const category = await store.getCategoryById(randomUUID());
      expect(category).toBeUndefined();
    });
  });

  describe("Item Types", () => {
    let testCategory: ItemCategory;

    beforeEach(async () => {
      testCategory = { uuid: randomUUID(), nom: "Arme" };
      await store.saveCategories([testCategory]);
    });

    it("devrait créer et récupérer des types d'items", async () => {
      const itemType: ItemType = {
        uuid: randomUUID(),
        nom: "Épée",
        description: "Une épée simple",
        categorie: testCategory,
        effets: [{ caracteristique: "Force", valeur: 10 }],
        rarete: "Commun",
      };

      await store.saveItemType(itemType);
      const retrieved = await store.getItemTypes();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].nom).toBe("Épée");
      expect(retrieved[0].effets).toHaveLength(1);
    });

    it("devrait récupérer un type d'item par UUID", async () => {
      const itemType: ItemType = {
        uuid: randomUUID(),
        nom: "Épée",
        description: "Une épée simple",
        categorie: testCategory,
        effets: [],
        rarete: "Commun",
      };

      await store.saveItemType(itemType);
      const retrieved = await store.getItemTypeById(itemType.uuid);

      expect(retrieved).toBeDefined();
      expect(retrieved?.nom).toBe("Épée");
    });

    it("devrait mettre à jour un type d'item existant", async () => {
      const itemType: ItemType = {
        uuid: randomUUID(),
        nom: "Épée",
        description: "Une épée simple",
        categorie: testCategory,
        effets: [],
        rarete: "Commun",
      };

      await store.saveItemType(itemType);

      const updated: ItemType = {
        ...itemType,
        nom: "Épée Longue",
        rarete: "Rare",
      };

      await store.saveItemType(updated);
      const retrieved = await store.getItemTypeById(itemType.uuid);

      expect(retrieved?.nom).toBe("Épée Longue");
      expect(retrieved?.rarete).toBe("Rare");
    });

    it("devrait supprimer un type d'item", async () => {
      const itemType: ItemType = {
        uuid: randomUUID(),
        nom: "Épée",
        description: "Une épée simple",
        categorie: testCategory,
        effets: [],
        rarete: "Commun",
      };

      await store.saveItemType(itemType);
      const deleted = await store.deleteItemType(itemType.uuid);

      expect(deleted).toBe(true);

      const retrieved = await store.getItemTypeById(itemType.uuid);
      expect(retrieved).toBeUndefined();
    });

    it("devrait retourner false lors de la suppression d'un type inexistant", async () => {
      const deleted = await store.deleteItemType(randomUUID());
      expect(deleted).toBe(false);
    });
  });

  describe("Items", () => {
    let testItemType: ItemType;

    beforeEach(async () => {
      const testCategory = { uuid: randomUUID(), nom: "Arme" };
      await store.saveCategories([testCategory]);

      testItemType = {
        uuid: randomUUID(),
        nom: "Épée",
        description: "Une épée simple",
        categorie: testCategory,
        effets: [{ caracteristique: "Force", valeur: 10 }],
        rarete: "Commun",
      };
      await store.saveItemType(testItemType);
    });

    it("devrait créer et récupérer des items", async () => {
      const item: Item = {
        uuid: randomUUID(),
        itemType: testItemType,
        position: { x: 10, y: 20 },
        roomId: randomUUID(),
        rarete: "Commun",
      };

      await store.saveItem(item);
      const retrieved = await store.getItems();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].itemType.nom).toBe("Épée");
      expect(retrieved[0].position?.x).toBe(10);
    });

    it("devrait récupérer un item par UUID", async () => {
      const item: Item = {
        uuid: randomUUID(),
        itemType: testItemType,
        rarete: "Commun",
      };

      await store.saveItem(item);
      const retrieved = await store.getItemById(item.uuid);

      expect(retrieved).toBeDefined();
      expect(retrieved?.itemType.nom).toBe("Épée");
    });

    it("devrait mettre à jour un item existant", async () => {
      const item: Item = {
        uuid: randomUUID(),
        itemType: testItemType,
        rarete: "Commun",
      };

      await store.saveItem(item);

      const updated: Item = {
        ...item,
        position: { x: 50, y: 60 },
        rarete: "Rare",
      };

      await store.saveItem(updated);
      const retrieved = await store.getItemById(item.uuid);

      expect(retrieved?.position?.x).toBe(50);
      expect(retrieved?.rarete).toBe("Rare");
    });

    it("devrait supprimer un item", async () => {
      const item: Item = {
        uuid: randomUUID(),
        itemType: testItemType,
        rarete: "Commun",
      };

      await store.saveItem(item);
      const deleted = await store.deleteItem(item.uuid);

      expect(deleted).toBe(true);

      const retrieved = await store.getItemById(item.uuid);
      expect(retrieved).toBeUndefined();
    });

    it("devrait retourner false lors de la suppression d'un item inexistant", async () => {
      const deleted = await store.deleteItem(randomUUID());
      expect(deleted).toBe(false);
    });
  });
});
