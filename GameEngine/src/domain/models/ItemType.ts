export interface ItemType {
  id: number;
  nom: string;
  description?: string;
  baseStats?: {
    attack?: number;
    defense?: number;
    health?: number;
  };
}