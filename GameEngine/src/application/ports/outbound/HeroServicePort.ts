import { Hero } from '../../../domain/models/Hero';

export interface HeroServicePort {
  getHero(id: number): Promise<Hero>;
}