import { Tree } from "../../../domain/models/Tree";

export interface TreeServicePort {
  get(uuid: string): Tree | null;

  list(): Tree[];

  save(tree: Tree): Tree;
}
