import Forest from "../../../domain/models/Forest";

/**
 * TODO : You will add some methods in this interface to compute the carbon dioxide absorption.
 */
export interface CO2AbsorptionServicePort {
  getAbsorption(forest: Forest): number;
}
