import { Species } from "./Species";
import { Exposure } from "./Exposure";

export interface Tree {
  id?: string;
  birth: Date;
  species: Species;
  exposure: Exposure;
  carbonStorageCapacity: number; // Between 10 and 50 kg/year
}