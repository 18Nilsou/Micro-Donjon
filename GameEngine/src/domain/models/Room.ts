import { Dimension } from './Dimension';
import { Position } from './Position';

export interface Room {
  id: string;
  dimensions: Dimension;
  entrance: Position;
  exit: Position;
  order: number;
  description?: string;
}