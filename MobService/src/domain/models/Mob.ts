export interface Mob {
    id: number;
    name: string;
    healthPoints: number;
    healthPointsMax: number;
    attackPoints: number;
    type: 'Common' | 'Boss';
}