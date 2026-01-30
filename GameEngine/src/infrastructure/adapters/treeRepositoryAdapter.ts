import { Tree } from "../../domain/models/Tree";
import { v4 as uuidv4 } from "uuid";

export class TreeRepositoryAdapter {
  trees: Tree[] = [];

  findAll(): Tree[] {
    return this.trees;
  }

  insert(tree: Tree): Tree {
    const persistedTree: Tree = {
      id: uuidv4(),
      birth: tree.birth,
      species: tree.species,
      exposure: tree.exposure,
      carbonStorageCapacity: tree.carbonStorageCapacity
    };
    this.trees.push(tree);
    return tree;
  }
}