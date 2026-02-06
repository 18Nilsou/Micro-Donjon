export interface ItemDetails {
    id: number;
    name: string;
    effect: ItemEffect;
    value: number;
    itemType: ItemType;
}

type ItemEffect = 'Attack' | 'Heal' | 'HealthPointMax';
type ItemType = 'Weapon' | 'Consumable' | 'Armor';