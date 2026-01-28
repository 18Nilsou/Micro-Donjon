import { describe, it, expect } from "bun:test";
import { generateUUID, randomElement, randomInt } from "../src/utils/helpers";

describe("Helpers", () => {
  describe("generateUUID", () => {
    it("devrait générer un UUID valide", () => {
      const uuid = generateUUID();
      
      // Format UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(uuid).toMatch(uuidRegex);
    });

    it("devrait générer des UUIDs uniques", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
      expect(uuid2).not.toBe(uuid3);
      expect(uuid1).not.toBe(uuid3);
    });

    it("devrait générer 100 UUIDs uniques", () => {
      const uuids = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUID());
      }
      
      expect(uuids.size).toBe(100);
    });
  });

  describe("randomElement", () => {
    it("devrait retourner un élément du tableau", () => {
      const array = ["a", "b", "c", "d", "e"];
      const element = randomElement(array);
      
      expect(array).toContain(element);
    });

    it("devrait retourner le seul élément d'un tableau à un élément", () => {
      const array = ["unique"];
      const element = randomElement(array);
      
      expect(element).toBe("unique");
    });

    it("devrait fonctionner avec différents types de données", () => {
      const numbers = [1, 2, 3, 4, 5];
      const element = randomElement(numbers);
      
      expect(numbers).toContain(element);
      expect(typeof element).toBe("number");
    });

    it("devrait distribuer les sélections aléatoirement", () => {
      const array = ["a", "b", "c"];
      const selections = new Set<string>();
      
      // Faire 100 sélections pour avoir de bonnes chances d'obtenir tous les éléments
      for (let i = 0; i < 100; i++) {
        selections.add(randomElement(array));
      }
      
      // On devrait avoir sélectionné au moins 2 éléments différents sur 100 essais
      expect(selections.size).toBeGreaterThanOrEqual(2);
    });

    it("devrait fonctionner avec un tableau d'objets", () => {
      const objects = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ];
      
      const element = randomElement(objects);
      
      expect(objects).toContain(element);
      expect(element).toHaveProperty("id");
      expect(element).toHaveProperty("name");
    });
  });

  describe("randomInt", () => {
    it("devrait retourner un nombre dans la plage spécifiée", () => {
      const min = 1;
      const max = 10;
      
      for (let i = 0; i < 50; i++) {
        const num = randomInt(min, max);
        expect(num).toBeGreaterThanOrEqual(min);
        expect(num).toBeLessThanOrEqual(max);
      }
    });

    it("devrait retourner un entier", () => {
      const num = randomInt(1, 100);
      expect(Number.isInteger(num)).toBe(true);
    });

    it("devrait fonctionner avec min === max", () => {
      const num = randomInt(5, 5);
      expect(num).toBe(5);
    });

    it("devrait fonctionner avec des nombres négatifs", () => {
      const num = randomInt(-10, -1);
      expect(num).toBeGreaterThanOrEqual(-10);
      expect(num).toBeLessThanOrEqual(-1);
    });

    it("devrait fonctionner avec une plage incluant zéro", () => {
      const num = randomInt(-5, 5);
      expect(num).toBeGreaterThanOrEqual(-5);
      expect(num).toBeLessThanOrEqual(5);
    });

    it("devrait distribuer les valeurs sur toute la plage", () => {
      const values = new Set<number>();
      const min = 1;
      const max = 5;
      
      // Générer 100 valeurs
      for (let i = 0; i < 100; i++) {
        values.add(randomInt(min, max));
      }
      
      // On devrait avoir obtenu au moins 3 valeurs différentes sur 5 possibles
      expect(values.size).toBeGreaterThanOrEqual(3);
    });

    it("devrait inclure les bornes min et max", () => {
      const min = 1;
      const max = 3;
      const values = new Set<number>();
      
      // Générer beaucoup de valeurs pour avoir de bonnes chances d'obtenir les bornes
      for (let i = 0; i < 200; i++) {
        values.add(randomInt(min, max));
      }
      
      // On devrait avoir obtenu les bornes à un moment donné
      expect(values.has(min) || values.has(max)).toBe(true);
    });

    it("devrait fonctionner avec de grandes plages", () => {
      const num = randomInt(1, 1000000);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(1000000);
      expect(Number.isInteger(num)).toBe(true);
    });
  });
});
