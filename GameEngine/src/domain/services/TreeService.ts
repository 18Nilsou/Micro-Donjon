import { TreeServicePort } from "../../application/ports/inbound/TreeServicePort";
import { Tree } from "../models/Tree";
import { TreeRepositoryPort } from "../../application/ports/outbound/TreeRepositoryPort";
import { NotFoundError } from "../errors/NotFoundError";

export class TreeService implements TreeServicePort {
  constructor(private readonly repo: TreeRepositoryPort) {}

  get(uuid: string): Tree {
    const tree = this.repo.findAll().find((tree) => tree.id === uuid);
    if (!tree) {
      throw new NotFoundError('Tree not found');
    }
    return tree;
  }

  list(): Tree[] {
    return this.repo.findAll();
  }

  save(tree: Tree): Tree {
    if (tree.birth === null) {
      throw new Error("Tree birth date cannot be null");
    }

    // Some other validation rules could be defined here

    return this.repo.insert(tree);
  }

}