import { FightServicePort } from '../../application/ports/inbound/FightServicePort';
import { Express, Response, Request } from 'express';

export class FightController {
  constructor(private fightService: FightServicePort) {}

  registerRoutes(app: Express) {
    app.post('/fight', this.startFight.bind(this));
    app.put('/fight', this.updateFight.bind(this));
    app.get('/fight', this.getFight.bind(this));
    app.delete('/fight', this.deleteFight.bind(this));
  }

  async startFight(req: Request, res: Response) {
    try {
      const fight = req.body;
      const result = await this.fightService.startFight(fight);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getFight(req: Request, res: Response) {
    try {
      const fight = await this.fightService.getFight();
      res.status(200).json(fight);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateFight(req: Request, res: Response) {
    try {
      const updates = req.body;
      const fight = await this.fightService.updateFight(updates);
      res.status(200).json(fight);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteFight(req: Request, res: Response) {
    try {
      await this.fightService.deleteFight();
      res.status(200).json({ message: 'Fight deleted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}