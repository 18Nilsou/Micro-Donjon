import { Dimension } from './Dimension';
import { Position } from './Position';

export interface Room {
  id: string;
  dimension: Dimension;
  entrance: Position;
  exit: Position;
  order: number;
  description?: string;
}