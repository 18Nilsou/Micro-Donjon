export type Caracteristique = 'Force' | 'Agilite' | 'Intelligence' | 'PointsDeVie';

export interface Effect {
  caracteristique: Caracteristique;
  valeur: number;
}