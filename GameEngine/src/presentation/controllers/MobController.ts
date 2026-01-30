import { MobServicePort } from '../../application/ports/inbound/MobServicePort';
import { Express, Response, Request } from 'express';

export class MobController {
  constructor(private mobService: MobServicePort) {}

  registerRoutes(app: Express) {
    app.get('/mob/:mobId', this.getMob.bind(this));
    app.put('/mob/:mobId', this.updateMob.bind(this));
    app.delete('/mob/:mobId', this.deleteMob.bind(this));
    app.get('/mob', this.getMobs.bind(this));
    app.post('/mob', this.createMob.bind(this));
    app.delete('/mob', this.deleteMobByData.bind(this));
  }

  async getMob(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.mobId);
      const mob = await this.mobService.getMob(id);
      res.status(200).json(mob);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async updateMob(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.mobId);
      const mob = req.body;
      const result = await this.mobService.updateMob(id, mob);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async deleteMob(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.mobId);
      await this.mobService.deleteMob(id);
      res.status(200).json({ message: 'Mob deleted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getMobs(req: Request, res: Response) {
    try {
      const mobs = await this.mobService.getMobs();
      res.status(200).json(mobs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async createMob(req: Request, res: Response) {
    try {
      const mob = req.body;
      const result = await this.mobService.createMob(mob);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async deleteMobByData(req: Request, res: Response) {
    try {
      const mob = req.body;
      await this.mobService.deleteMobByData(mob);
      res.status(200).json({ message: 'Mob deleted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}