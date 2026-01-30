import { Hero } from '../../domain/models/Hero';
import { HeroServicePort } from '../../application/ports/outbound/HeroServicePort';
import axios from 'axios';

export class HeroServiceAdapter implements HeroServicePort {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.HERO_SERVICE_URL || 'http://localhost:3005';
  }

  async getHero(id: number): Promise<Hero> {
    const response = await axios.get(`${this.baseUrl}/hero/${id}`);
    return response.data;
  }
}