import { Express, Response, Request } from "express";
import { Hero } from "../domain/models/Hero";
import { HeroService } from "../services/HeroService";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { ForbiddenError } from "../domain/errors/ForbiddenError";
import { Class } from "../domain/models/Class";
import { CreateHeroRequest } from "../domain/models/CreateHeroRequest";

export class HeroController {

  constructor(private heroService: HeroService) { }

  registerRoutes(app: Express) {
    app.get('/heroes/user/:userId', this.listUserHeroes.bind(this));
    app.get('/heroes/classes', this.listAllClasses.bind(this));
    app.post('/heroes', this.createHero.bind(this));
    app.get('/heroes/:id', this.getHeroById.bind(this));
    app.delete('/heroes/:id', this.deleteHero.bind(this));
    app.put('/heroes/:id/healthPoints', this.updateHeroHealthPoints.bind(this));
    app.put('/heroes/:id/healthPointsMax', this.updateHeroHealthPointsMax.bind(this));
    app.put('/heroes/:id/level', this.updateHeroLevel.bind(this));
    app.put('/heroes/:id/attackPoints', this.updateHeroAttackPoints.bind(this));
    app.post('/heroes/:id/inventory/add', this.addHeroItem.bind(this));
    app.put('/heroes/:id/inventory', this.addHeroItem.bind(this));
    app.post('/heroes/:id/inventory', this.addHeroItem.bind(this));
    app.post('/heroes/:id/inventory/consume', this.consumeHeroItem.bind(this));
    app.get('/heroes/:id/inventory', this.getHeroInventory.bind(this));
  }

  private getUserIdFromRequest(req: Request): string {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new Error('User ID not found in request headers');
    }
    return userId;
  }

  async listUserHeroes(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const requestingUserId = this.getUserIdFromRequest(req);

      // Verify that user is requesting their own heroes
      if (userId !== requestingUserId) {
        return res.status(403).send({ error: 'Access denied: You can only view your own heroes' });
      }

      const heroes: Hero[] = await this.heroService.listByUserId(userId);
      res.status(200).send(heroes);
    } catch (error) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  async listAllClasses(req: Request, res: Response) {
    const classes: Class[] = await this.heroService.listClasses();
    res.status(200).send(classes);
  }

  async createHero(req: Request, res: Response) {
    try {
      const userId = this.getUserIdFromRequest(req);
      const heroData: CreateHeroRequest = {
        ...req.body,
        userId
      };
      const newHero: Hero = await this.heroService.create(heroData);
      res.status(201).send(newHero);
    } catch (error: any) {
      res.status(500).send({ error: error.message || 'Internal Server Error' });
    }
  }

  async getHeroById(req: Request, res: Response) {
    const heroId = req.params.id;
    try {
      const userId = this.getUserIdFromRequest(req);
      const hero: Hero = await this.heroService.getById(heroId, userId);
      res.status(200).send(hero);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else if (error instanceof ForbiddenError) {
        res.status(403).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async deleteHero(req: Request, res: Response) {
    const heroId = req.params.id;
    try {
      // const userId = this.getUserIdFromRequest(req);
      await this.heroService.delete(heroId);
      res.status(200).send({ message: 'Hero deleted successfully' });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async updateHeroHealthPoints(req: Request, res: Response) {
    const heroId = req.params.id;
    const { healthPoints } = req.body;
    try {
      // const userId = this.getUserIdFromRequest(req);
      const updatedHero: Hero = await this.heroService.updateHealthPoints(heroId, healthPoints);
      res.status(200).send(updatedHero);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async updateHeroHealthPointsMax(req: Request, res: Response) {
    const heroId = req.params.id;
    const { healthPointsMax } = req.body;
    try {
      const userId = this.getUserIdFromRequest(req);
      const updatedHero: Hero = await this.heroService.updateHealthPointsMax(heroId, healthPointsMax, userId);
      res.status(200).send(updatedHero);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async updateHeroLevel(req: Request, res: Response) {
    const heroId = req.params.id;
    try {
      // const userId = this.getUserIdFromRequest(req);
      const updatedHero: Hero = await this.heroService.updateLevel(heroId);
      res.status(200).send(updatedHero);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async updateHeroAttackPoints(req: Request, res: Response) {
    const heroId = req.params.id;
    const { attackPoints } = req.body;
    try {
      const userId = this.getUserIdFromRequest(req);
      const updatedHero: Hero = await this.heroService.updateAttackPoints(heroId, attackPoints, userId);
      res.status(200).send(updatedHero);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async addHeroItem(req: Request, res: Response) {
    const heroId = req.params.id;
    const { id, quantity } = req.body;
    try {
      const userId = this.getUserIdFromRequest(req);
      await this.heroService.addItemToInventory(id, quantity, heroId, userId);
      const updatedHero = await this.heroService.getById(heroId);
      res.status(200).send(updatedHero);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async getHeroInventory(req: Request, res: Response) {
    const heroId = req.params.id;
    try {
      const userId = this.getUserIdFromRequest(req);
      const inventory = await this.heroService.getInventory(heroId, userId);
      res.status(200).send(inventory);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async consumeHeroItem(req: Request, res: Response) {
    const heroId = req.params.id;
    const { id } = req.body;
    try {
      const userId = this.getUserIdFromRequest(req);
      const updatedHero = await this.heroService.consumeItemFromInventory(id, heroId, userId);
      res.status(200).send(updatedHero);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else if (error instanceof ForbiddenError) {
        res.status(403).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
}