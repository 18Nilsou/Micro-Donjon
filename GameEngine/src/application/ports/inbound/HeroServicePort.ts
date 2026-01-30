import { Hero } from '../../../domain/models/Hero';

export interface HeroServicePort {
  moveHero(heroId: number, x: number, y: number): Promise<Hero>;
}