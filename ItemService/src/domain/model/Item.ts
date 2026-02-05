export type Rarete = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type Caracteristique = 'Attack' | 'Heal' | 'HealthPointMax' ;
export type ItemType = 'Weapon' | 'Consumable' | 'Armor' ;

export class Item {
  
  id!: number;
  
  name!: string;
  
  effect!: Caracteristique;
  
  value!: number;
  
  description?: string;
  
  rarity!: Rarete;

  itemType!: ItemType;
}
