import { ForestType } from "./ForestType";
import { Tree } from "./Tree";

export default interface Forest {
  id: string;
  type: ForestType;
  trees: Tree[];
  surface: number;
}