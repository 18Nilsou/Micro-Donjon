import { Express, Response, Request } from "express";
import { Mob } from "../domain/models/Mob";
import { MobService } from "../services/MobService";
import { NotFoundError } from "../domain/errors/NotFoundError";

export class MobController {

  constructor(private mobService: MobService) { }

  registerRoutes(app: Express) {
    app.get('/mobs', this.listAllMobs.bind(this));
    app.get('/mobs/:type', this.getMobsByType.bind(this));
  }

  listAllMobs(req: Request, res: Response) {
    const mobs: Mob[] = this.mobService.list();
    res.status(200).send(mobs);
  }

  getMobsByType(req: Request, res: Response) {
    const type = req.params.type as 'Common' | 'Boss';

    const mobs: Mob[] = this.mobService.getByType(type);

    if (mobs.length === 0) {
      throw new NotFoundError(`No mobs found of type: ${type}`);
    }

    res.status(200).send(mobs);
  }
}