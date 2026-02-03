import { Express, Response, Request } from "express";
import { Hero } from "../domain/models/Hero";
import { HeroService } from "../services/HeroService";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { Class } from "../domain/models/Class";
import { CreateHeroRequest } from "../domain/models/CreateHeroRequest";

export class HeroController {

  constructor(private heroService: HeroService) { }

  registerRoutes(app: Express) {
    app.get('/heroes', this.listAllHeroes.bind(this));
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
    app.get('/heroes/:id/inventory', this.getHeroInventory.bind(this));
  }

  async listAllHeroes(req: Request, res: Response) {
    const heroes: Hero[] = await this.heroService.list();
    res.status(200).send(heroes);
  }

  async listAllClasses(req: Request, res: Response) {
    const classes: Class[] = await this.heroService.listClasses();
    res.status(200).send(classes);
  }

  async createHero(req: Request, res: Response) {
    const heroData: CreateHeroRequest = req.body;
    const newHero: Hero = await this.heroService.create(heroData);
    res.status(201).send(newHero);
  }

  async getHeroById(req: Request, res: Response) {
    const heroId = req.params.id;
    try {
      const hero: Hero = await this.heroService.getById(heroId);
      res.status(200).send(hero);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }

  async deleteHero(req: Request, res: Response) {
    const heroId = req.params.id;
    try {
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
      const updatedHero: Hero = await this.heroService.updateHealthPointsMax(heroId, healthPointsMax);
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
    const { level } = req.body;
    try {
      const updatedHero: Hero = await this.heroService.updateLevel(heroId, level);
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
      const updatedHero: Hero = await this.heroService.updateAttackPoints(heroId, attackPoints);
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
      await this.heroService.addItemToInventory(id, quantity, heroId);
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
      const inventory = await this.heroService.getInventory(heroId);
      res.status(200).send(inventory);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
}