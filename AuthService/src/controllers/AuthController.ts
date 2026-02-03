import { Express, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {

  constructor(private readonly authService: AuthService) {}

  registerRoutes(app: Express) {
    app.post('/auth/register', this.register.bind(this));
    app.post('/auth/login', this.login.bind(this));
    app.get('/auth/me', this.getMe.bind(this));
    app.get('/auth/verify', this.verifyToken.bind(this));
    app.put('/auth/hero', this.linkHero.bind(this));
    app.delete('/auth/hero', this.unlinkHero.bind(this));
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractToken(req);
      const user = await this.authService.verifyToken(token);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractToken(req);
      const user = await this.authService.verifyToken(token);
      res.status(200).json({ valid: true, user });
    } catch (error) {
      res.status(200).json({ valid: false });
    }
  }

  async linkHero(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractToken(req);
      const currentUser = await this.authService.verifyToken(token);
      const { heroId } = req.body;
      const user = await this.authService.linkHeroToUser(currentUser.id, heroId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async unlinkHero(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractToken(req);
      const currentUser = await this.authService.verifyToken(token);
      const user = await this.authService.unlinkHeroFromUser(currentUser.id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  private extractToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }
    return authHeader.substring(7);
  }
}
