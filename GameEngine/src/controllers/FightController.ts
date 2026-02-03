import { Express, Response, Request } from 'express';
import { FightService } from '../services/FightService';

export class FightController {

  constructor(private fightService: FightService) { }

  registerRoutes(app: Express) {
    app.post('/fight', this.startFight.bind(this));
    app.post('/fight/:id/attack', this.attack.bind(this));
    app.post('/fight/:id/defend', this.defend.bind(this));
    app.post('/fight/:id/flee', this.flee.bind(this));
    app.put('/fight', this.updateFight.bind(this));
    app.get('/fight', this.getFight.bind(this));
    app.delete('/fight', this.deleteFight.bind(this));
  }

  async attack(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID not found' });
      }
      const result = await this.fightService.attack(id, userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async defend(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID not found' });
      }
      const result = await this.fightService.defend(id, userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async flee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID not found' });
      }
      const result = await this.fightService.flee(id, userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async startFight(req: Request, res: Response) {
    try {
      const fight = req.body;
      const result = await this.fightService.startFight(fight);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
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