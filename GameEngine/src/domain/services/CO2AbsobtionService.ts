import { CO2AbsorptionServicePort } from "../../application/ports/inbound/CO2AbsorptionServicePort";
import Forest from "../models/Forest";

export class CO2AbsorptionService implements CO2AbsorptionServicePort {
  getAbsorption(forest: Forest): number {
    throw new Error("TODO : implement this method");
  }
}