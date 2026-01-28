import { z } from "zod";

export const RarityEnum = z.enum(["Commun", "Rare", "Epic", "Legendaire"]);
export type Rarity = z.infer<typeof RarityEnum>;

export const CharacteristicEnum = z.enum([
  "Force",
  "Agilite",
  "Intelligence",
  "PointsDeVie",
]);
export type Characteristic = z.infer<typeof CharacteristicEnum>;

export const EffectSchema = z.object({
  caracteristique: CharacteristicEnum,
  valeur: z.number().int(),
});
export type Effect = z.infer<typeof EffectSchema>;

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Position = z.infer<typeof PositionSchema>;

export const ItemCategorySchema = z.object({
  uuid: z.string().uuid(),
  nom: z.string(),
});
export type ItemCategory = z.infer<typeof ItemCategorySchema>;

export const ItemTypeSchema = z.object({
  uuid: z.string().uuid(),
  nom: z.string(),
  description: z.string().optional(),
  categorie: ItemCategorySchema,
  effets: z.array(EffectSchema).default([]),
  rarete: RarityEnum.default("Commun"),
});
export type ItemType = z.infer<typeof ItemTypeSchema>;

export const ItemTypeCreateSchema = z.object({
  nom: z.string(),
  description: z.string().optional(),
  categorieUuid: z.string().uuid(),
  effets: z.array(EffectSchema).default([]),
  rarete: RarityEnum.default("Commun"),
});
export type ItemTypeCreate = z.infer<typeof ItemTypeCreateSchema>;

export const ItemTypeUpdateSchema = z.object({
  nom: z.string().optional(),
  description: z.string().optional(),
  categorieUuid: z.string().uuid().optional(),
  effets: z.array(EffectSchema).optional(),
  rarete: RarityEnum.optional(),
});
export type ItemTypeUpdate = z.infer<typeof ItemTypeUpdateSchema>;

export const ItemSchema = z.object({
  uuid: z.string().uuid(),
  itemType: ItemTypeSchema,
  position: PositionSchema.optional(),
  roomId: z.string().uuid().optional(),
  rarete: RarityEnum.default("Commun"),
});
export type Item = z.infer<typeof ItemSchema>;

export const ItemGenerateSchema = z.object({
  rarity: RarityEnum.optional(),
  itemTypeUuid: z.string().uuid().optional(),
  position: PositionSchema.optional(),
  roomId: z.string().uuid().optional(),
});
export type ItemGenerate = z.infer<typeof ItemGenerateSchema>;

export const ErrorSchema = z.object({
  message: z.string(),
  code: z.number().int(),
});
export type Error = z.infer<typeof ErrorSchema>;
