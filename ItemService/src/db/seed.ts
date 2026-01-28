import { store } from "./store";
import type { ItemCategory, ItemType } from "../schemas/types";
import { generateUUID } from "../utils/helpers";

async function seedData() {
  console.log("Initialisation des données de seed...");

  // Créer les catégories d'items
  const categories: ItemCategory[] = [
    { uuid: generateUUID(), nom: "Arme" },
    { uuid: generateUUID(), nom: "Armure" },
    { uuid: generateUUID(), nom: "Potion" },
    { uuid: generateUUID(), nom: "Trésor" },
    { uuid: generateUUID(), nom: "Accessoire" },
  ];

  await store.saveCategories(categories);
  console.log(`✓ ${categories.length} catégories créées`);

  // Créer les types d'items
  const armeCategory = categories.find((c) => c.nom === "Arme")!;
  const armureCategory = categories.find((c) => c.nom === "Armure")!;
  const potionCategory = categories.find((c) => c.nom === "Potion")!;
  const tresorCategory = categories.find((c) => c.nom === "Trésor")!;
  const accessoireCategory = categories.find((c) => c.nom === "Accessoire")!;

  const itemTypes: ItemType[] = [
    // Armes
    {
      uuid: generateUUID(),
      nom: "Épée Courte",
      description: "Une lame simple mais efficace",
      categorie: armeCategory,
      effets: [{ caracteristique: "Force", valeur: 5 }],
      rarete: "Commun",
    },
    {
      uuid: generateUUID(),
      nom: "Épée Longue",
      description: "Une arme à deux mains puissante",
      categorie: armeCategory,
      effets: [{ caracteristique: "Force", valeur: 12 }],
      rarete: "Rare",
    },
    {
      uuid: generateUUID(),
      nom: "Lame de l'Exilé",
      description: "Une épée dont la lame semble palpiter de chaleur",
      categorie: armeCategory,
      effets: [
        { caracteristique: "Force", valeur: 25 },
        { caracteristique: "Intelligence", valeur: 10 },
      ],
      rarete: "Legendaire",
    },
    {
      uuid: generateUUID(),
      nom: "Dague Empoisonnée",
      description: "Une dague imprégnée de poison mortel",
      categorie: armeCategory,
      effets: [
        { caracteristique: "Agilite", valeur: 15 },
        { caracteristique: "Force", valeur: 8 },
      ],
      rarete: "Epic",
    },
    {
      uuid: generateUUID(),
      nom: "Bâton de Mage",
      description: "Un bâton orné de runes anciennes",
      categorie: armeCategory,
      effets: [{ caracteristique: "Intelligence", valeur: 20 }],
      rarete: "Rare",
    },

    // Armures
    {
      uuid: generateUUID(),
      nom: "Armure de Cuir",
      description: "Une protection légère et flexible",
      categorie: armureCategory,
      effets: [
        { caracteristique: "PointsDeVie", valeur: 20 },
        { caracteristique: "Agilite", valeur: 3 },
      ],
      rarete: "Commun",
    },
    {
      uuid: generateUUID(),
      nom: "Armure de Plates",
      description: "Une armure lourde offrant une excellente protection",
      categorie: armureCategory,
      effets: [
        { caracteristique: "PointsDeVie", valeur: 50 },
        { caracteristique: "Force", valeur: 5 },
      ],
      rarete: "Rare",
    },
    {
      uuid: generateUUID(),
      nom: "Armure du Dragon",
      description: "Forgée à partir d'écailles de dragon",
      categorie: armureCategory,
      effets: [
        { caracteristique: "PointsDeVie", valeur: 100 },
        { caracteristique: "Force", valeur: 15 },
        { caracteristique: "Intelligence", valeur: 10 },
      ],
      rarete: "Legendaire",
    },

    // Potions
    {
      uuid: generateUUID(),
      nom: "Potion de Soin Mineure",
      description: "Restaure une petite quantité de points de vie",
      categorie: potionCategory,
      effets: [{ caracteristique: "PointsDeVie", valeur: 30 }],
      rarete: "Commun",
    },
    {
      uuid: generateUUID(),
      nom: "Potion de Soin Majeure",
      description: "Restaure une grande quantité de points de vie",
      categorie: potionCategory,
      effets: [{ caracteristique: "PointsDeVie", valeur: 80 }],
      rarete: "Rare",
    },
    {
      uuid: generateUUID(),
      nom: "Elixir de Force",
      description: "Augmente temporairement la force",
      categorie: potionCategory,
      effets: [{ caracteristique: "Force", valeur: 10 }],
      rarete: "Rare",
    },
    {
      uuid: generateUUID(),
      nom: "Potion d'Agilité",
      description: "Augmente la vivacité et la rapidité",
      categorie: potionCategory,
      effets: [{ caracteristique: "Agilite", valeur: 12 }],
      rarete: "Epic",
    },

    // Trésors
    {
      uuid: generateUUID(),
      nom: "Pièce d'Or",
      description: "Une simple pièce d'or",
      categorie: tresorCategory,
      effets: [],
      rarete: "Commun",
    },
    {
      uuid: generateUUID(),
      nom: "Gemme Précieuse",
      description: "Une gemme scintillante de grande valeur",
      categorie: tresorCategory,
      effets: [],
      rarete: "Rare",
    },
    {
      uuid: generateUUID(),
      nom: "Couronne Antique",
      description: "Une couronne d'un ancien roi oublié",
      categorie: tresorCategory,
      effets: [{ caracteristique: "Intelligence", valeur: 15 }],
      rarete: "Legendaire",
    },

    // Accessoires
    {
      uuid: generateUUID(),
      nom: "Anneau de Protection",
      description: "Un anneau qui augmente la vitalité",
      categorie: accessoireCategory,
      effets: [{ caracteristique: "PointsDeVie", valeur: 25 }],
      rarete: "Rare",
    },
    {
      uuid: generateUUID(),
      nom: "Amulette du Sage",
      description: "Augmente la sagesse et l'intelligence",
      categorie: accessoireCategory,
      effets: [{ caracteristique: "Intelligence", valeur: 18 }],
      rarete: "Epic",
    },
    {
      uuid: generateUUID(),
      nom: "Bottes de Rapidité",
      description: "Permettent de se déplacer plus rapidement",
      categorie: accessoireCategory,
      effets: [{ caracteristique: "Agilite", valeur: 20 }],
      rarete: "Epic",
    },
  ];

  for (const itemType of itemTypes) {
    await store.saveItemType(itemType);
  }

  console.log(`✓ ${itemTypes.length} types d'items créés`);
  console.log("\nSeed terminé avec succès!");
  console.log(`\nRépartition par rareté:`);
  console.log(`  - Commun: ${itemTypes.filter((i) => i.rarete === "Commun").length}`);
  console.log(`  - Rare: ${itemTypes.filter((i) => i.rarete === "Rare").length}`);
  console.log(`  - Epic: ${itemTypes.filter((i) => i.rarete === "Epic").length}`);
  console.log(`  - Legendaire: ${itemTypes.filter((i) => i.rarete === "Legendaire").length}`);
}

seedData().catch(console.error);
