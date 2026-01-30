import { GameServicePort } from '../../application/ports/inbound/GameServicePort';
import { Express, Response, Request } from 'express';

export class GameController {
  constructor(private gameService: GameServicePort) {}

  registerRoutes(app: Express) {
    app.post('/game', this.createGame.bind(this));
    app.put('/game', this.updateGame.bind(this));
    app.get('/game', this.getGame.bind(this));
    app.delete('/game', this.deleteGame.bind(this));
    app.post('/game/start', this.startGame.bind(this));
  }

  async createGame(req: Request, res: Response) {
    try {
      // For post /game, create a new game? But yaml says Démarrer une nouvelle partie, but that's /game/start
      // Post /game is "Démarrer une nouvelle partie", but requestBody is Game, but /game/start is for heroId dungeonId
      // Perhaps /game post is for creating game with full data, but /game/start is specific.
      // For now, assume post /game is startGame with heroId dungeonId from body
      const { heroId, dungeonId } = req.body;
      const game = await this.gameService.startGame(heroId, dungeonId);
      res.status(201).json(game);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async startGame(req: Request, res: Response) {
    try {
      const { heroId, dungeonId } = req.body;
      const game = await this.gameService.startGame(heroId, dungeonId);
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