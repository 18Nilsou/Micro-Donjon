import { TreeServicePort } from "../../application/ports/inbound/TreeServicePort";
import { Express, Response, Request } from "express";

export class TreeController {
  constructor(private treeService: TreeServicePort) {}

  registerRoutes(app: Express) {
    app.get('/tree', this.listAllTrees.bind(this));
    app.get('/tree/:uuid', this.getTreeById.bind(this));
  }

  listAllTrees(req: Request, res: Response) {
    const trees = this.treeService.list();
    res.status(200).send(trees);
  }

  getTreeById(req: Request, res: Response) {
    const uuid: string = req.params.uuid;
    const tree = this.treeService.get(uuid);
    if (tree) {
      res.status(200).send(tree);
    } else {
      res.status(404).send({ message: "Tree not found" });
    }
  }
}