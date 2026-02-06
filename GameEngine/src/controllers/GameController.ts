import { Express, Response, Request } from 'express';
import { GameService } from '../services/GameService';

export class GameController {

  constructor(private gameService: GameService) { }

  registerRoutes(app: Express) {
    app.post('/game/start', this.startGame.bind(this));
    app.put('/game', this.updateGame.bind(this));
    app.get('/game', this.getGame.bind(this));
    app.delete('/game', this.deleteGame.bind(this));
  }

  async startGame(req: Request, res: Response) {
    try {
      const { hero, dungeon } = req.body;

      const game = await this.gameService.startGame(hero, dungeon);
      res.status(201).json(game);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getGame(req: Request, res: Response) {
    try {
      const game = await this.gameService.getGame();
      res.status(200).json(game);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateGame(req: Request, res: Response) {
    try {
      const updates = req.body;
      const game = await this.gameService.updateGame(updates);
      res.status(200).json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteGame(req: Request, res: Response) {
    try {
      await this.gameService.deleteGame();
      res.status(200).json({ message: 'Game deleted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}