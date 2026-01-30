import { HeroServicePort } from '../../application/ports/inbound/HeroServicePort';
import { Express, Response, Request } from 'express';

export class HeroController {
  constructor(private heroService: HeroServicePort) {}

  registerRoutes(app: Express) {
    app.put('/hero/:heroId/move', this.moveHero.bind(this));
  }

  async moveHero(req: Request, res: Response) {
    try {
      const heroId = parseInt(req.params.heroId);
      const { x, y } = req.body;
      const hero = await this.heroService.moveHero(heroId, x, y);
      res.status(200).json(hero);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}