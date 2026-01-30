export interface Hero {
  id:string;
  name: string;
  healthPoints: number;
  healthPointsMax: number;
  level: number;
  attackPoints: number;
  inventory: Array<{
    id: number;
    quantity: number;
  }>;
  or: number;
}      
