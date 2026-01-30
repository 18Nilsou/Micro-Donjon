import { Tree } from "../../../domain/models/Tree";

export interface TreeRepositoryPort {
  findAll(): Tree[];

  insert(tree: Tree): Tree;
}