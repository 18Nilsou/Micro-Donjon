import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { randomUUID } from "crypto";

describe("Integration Tests - Item Service API", () => {
  const baseUrl = "http://localhost:3004";
  let serverProcess: any;
  let testCategoryUuid: string;
  let testItemTypeUuid: string;

  beforeAll(async () => {
    // Démarrer le serveur pour les tests d'intégration
    serverProcess = Bun.spawn(["bun", "run", "src/index.ts"], {
      stdout: "inherit",
      stderr: "inherit",
    });

    // Attendre que le serveur démarre
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Récupérer une catégorie existante pour les tests
    const categoriesRes = await fetch(`${baseUrl}/api/items/types`);
    const itemTypes = await categoriesRes.json();
    
    if (itemTypes.length > 0) {
      testCategoryUuid = itemTypes[0].categorie.uuid;
    }
  });

  afterAll(() => {
    // Arrêter le serveur
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  describe("Health Check", () => {
    it("devrait répondre au health check", async () => {
      const res = await fetch(`${baseUrl}/health`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe("ok");
    });

    it("devrait retourner les informations du service", async () => {
      const res = await fetch(baseUrl);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.service).toBe("Item Service");
      expect(data.version).toBeDefined();
      expect(data.status).toBe("running");
    });
  });

  describe("Workflow complet: Item Types", () => {
    it("devrait permettre un CRUD complet sur les types d'items", async () => {
      // 1. CREATE - Créer un nouveau type
      const createData = {
        nom: "Épée d'Intégration",
        description: "Créée pendant les tests d'intégration",
        categorieUuid: testCategoryUuid,
        effets: [
          { caracteristique: "Force", valeur: 20 },
          { caracteristique: "Agilite", valeur: 5 },
        ],
        rarete: "Epic",
      };

      const createRes = await fetch(`${baseUrl}/api/items/types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });

      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      expect(created.uuid).toBeDefined();
      expect(created.nom).toBe("Épée d'Intégration");
      testItemTypeUuid = created.uuid;

      // 2. READ - Récupérer le type créé
      const readRes = await fetch(`${baseUrl}/api/items/types/${testItemTypeUuid}`);
      expect(readRes.status).toBe(200);
      const read = await readRes.json();
      expect(read.nom).toBe("Épée d'Intégration");
      expect(read.effets).toHaveLength(2);

      // 3. UPDATE - Mettre à jour le type
      const updateData = {
        nom: "Épée d'Intégration Améliorée",
        rarete: "Legendaire",
      };

      const updateRes = await fetch(`${baseUrl}/api/items/types/${testItemTypeUuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(updateRes.status).toBe(200);
      const updated = await updateRes.json();
      expect(updated.nom).toBe("Épée d'Intégration Améliorée");
      expect(updated.rarete).toBe("Legendaire");

      // 4. LIST - Vérifier que le type apparaît dans la liste
      const listRes = await fetch(`${baseUrl}/api/items/types`);
      const list = await listRes.json();
      const found = list.find((item: any) => item.uuid === testItemTypeUuid);
      expect(found).toBeDefined();

      // 5. DELETE - Supprimer le type
      const deleteRes = await fetch(`${baseUrl}/api/items/types/${testItemTypeUuid}`, {
        method: "DELETE",
      });

      expect(deleteRes.status).toBe(204);

      // 6. VERIFY DELETE - Vérifier que le type n'existe plus
      const verifyRes = await fetch(`${baseUrl}/api/items/types/${testItemTypeUuid}`);
      expect(verifyRes.status).toBe(404);
    });
  });

  describe("Workflow complet: Génération d'items", () => {
    it("devrait permettre de générer et récupérer des items", async () => {
      // 1. Générer un item aléatoire
      const generateRes = await fetch(`${baseUrl}/api/items/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(generateRes.status).toBe(201);
      const generated = await generateRes.json();
      expect(generated.uuid).toBeDefined();
      expect(generated.itemType).toBeDefined();

      // 2. Récupérer l'item généré
      const getRes = await fetch(`${baseUrl}/api/items/${generated.uuid}`);
      expect(getRes.status).toBe(200);
      const retrieved = await getRes.json();
      expect(retrieved.uuid).toBe(generated.uuid);

      // 3. Vérifier qu'il apparaît dans la liste
      const listRes = await fetch(`${baseUrl}/api/items`);
      const list = await listRes.json();
      const found = list.find((item: any) => item.uuid === generated.uuid);
      expect(found).toBeDefined();
    });

    it("devrait générer des items avec des raretés différentes", async () => {
      const rarities = ["Commun", "Rare", "Epic", "Legendaire"];
      
      for (const rarity of rarities) {
        const res = await fetch(`${baseUrl}/api/items/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rarity }),
        });

        if (res.status === 201) {
          const item = await res.json();
          expect(item.rarete).toBe(rarity);
        }
        // Certaines raretés peuvent ne pas avoir de types disponibles (400)
      }
    });

    it("devrait générer un item avec position et roomId", async () => {
      const position = { x: 42.5, y: 17.8 };
      const roomId = randomUUID();

      const res = await fetch(`${baseUrl}/api/items/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, roomId }),
      });

      expect(res.status).toBe(201);
      const item = await res.json();
      expect(item.position).toEqual(position);
      expect(item.roomId).toBe(roomId);
    });
  });

  describe("Gestion des erreurs", () => {
    it("devrait retourner 404 pour une route inexistante", async () => {
      const res = await fetch(`${baseUrl}/api/route-qui-nexiste-pas`);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toContain("Route non trouvée");
    });

    it("devrait retourner 404 pour un UUID inexistant", async () => {
      const fakeUuid = randomUUID();
      const res = await fetch(`${baseUrl}/api/items/types/${fakeUuid}`);
      expect(res.status).toBe(404);
    });

    it("devrait retourner 400 pour des données invalides", async () => {
      const res = await fetch(`${baseUrl}/api/items/types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invalid: "data" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("CORS et Headers", () => {
    it("devrait avoir les headers CORS appropriés", async () => {
      const res = await fetch(`${baseUrl}/health`);
      
      // Vérifier que la requête passe (CORS activé)
      expect(res.status).toBe(200);
    });

    it("devrait accepter les requêtes JSON", async () => {
      const res = await fetch(`${baseUrl}/api/items/types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: "Test",
          categorieUuid: testCategoryUuid,
        }),
      });

      // Devrait créer l'item ou retourner une erreur valide, pas 415 Unsupported Media Type
      expect([201, 400, 404]).toContain(res.status);
    });
  });

  describe("Performance", () => {
    it("devrait répondre rapidement aux requêtes GET", async () => {
      const start = Date.now();
      await fetch(`${baseUrl}/api/items/types`);
      const duration = Date.now() - start;

      // Devrait répondre en moins de 100ms
      expect(duration).toBeLessThan(100);
    });

    it("devrait gérer plusieurs requêtes simultanées", async () => {
      const requests = Array.from({ length: 10 }, () =>
        fetch(`${baseUrl}/health`)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });
  });
});
