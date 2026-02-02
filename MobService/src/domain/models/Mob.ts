export interface Mob {
    id: number;
    name: string;
    healthPoints: number;
    attackPoints: number;
    type: 'Common' | 'Boss';
}