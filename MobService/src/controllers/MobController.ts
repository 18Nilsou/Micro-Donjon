import { Express, Response, Request } from "express";
import { Mob } from "../domain/models/Mob";
import { MobService } from "../services/MobService";

export class MobController {

  constructor(private mobService: MobService) { }

  registerRoutes(app: Express) {
    app.get('/mobs', this.listAllMobs.bind(this));
    app.get('/mobs/:type', this.getMobsByType.bind(this));
  }

  async listAllMobs(req: Request, res: Response) {
    const mobs: Mob[] = await this.mobService.list();
    res.status(200).send(mobs);
  }

  async getMobsByType(req: Request, res: Response) {
    const type = req.params.type as 'Common' | 'Boss';

    const mobs: Mob[] = await this.mobService.getByType(type);

    res.status(200).send(mobs);
  }
}