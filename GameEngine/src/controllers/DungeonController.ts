import { Express, Response, Request } from 'express';
import { DungeonService } from '../services/DungeonService';

export class DungeonController {

  constructor(private dungeonService: DungeonService) { }

  registerRoutes(app: Express) {
    app.post('/dungeon', this.createDungeon.bind(this));
    app.get('/dungeon/:id', this.getDungeon.bind(this));
  }

  async createDungeon(req: Request, res: Response) {
    try {
      const dungeon = req.body;
      const result = await this.dungeonService.createDungeon(dungeon);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getDungeon(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const dungeon = await this.dungeonService.getDungeon(id);
      res.status(200).json(dungeon);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}