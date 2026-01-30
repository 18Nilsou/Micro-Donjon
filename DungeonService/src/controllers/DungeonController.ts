import { Express, Response, Request } from "express";
import { DungeonService } from "../services/DungeonService";
import { Dungeon } from "../domain/models/Dungeon";
import { GenerateDungeonRequest } from "../domain/models/GenerateDungeonRequest";

export class DungeonController {

  constructor(private dungeonService: DungeonService) { }

  registerRoutes(app: Express) {
    app.get('/dungeons', this.listAllDungeons.bind(this));
    app.get('/dungeons/:id', this.getDungeonsById.bind(this));
    app.post('/dungeons', this.createDungeon.bind(this));
  }

  async listAllDungeons(req: Request, res: Response) {
    const dungeons: Dungeon[] = await this.dungeonService.list();
    res.status(200).send(dungeons);
  }

  async getDungeonsById(req: Request, res: Response) {
    const id = req.params.id;

    const dungeon: Dungeon = await this.dungeonService.getById(id);

    res.status(200).send(dungeon);
  }

  async createDungeon(req: Request, res: Response) {
    const { name, numberOfRooms } = req.body as GenerateDungeonRequest;

    const dungeon: Dungeon = await this.dungeonService.insert(name, numberOfRooms);

    res.status(201).send(dungeon);
  }
}