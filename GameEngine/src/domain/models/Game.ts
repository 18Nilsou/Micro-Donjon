import { Position } from './Position';
import { Item } from './Item';

export interface Game {
  id: string;
  heroId: number;
  dungeonId: string;
  currentRoomId: string;
  heroPosition?: Position;
  status: 'active' | 'paused' | 'completed' | 'failed';
  startTime?: string;
  lastUpdate?: string;
  score?: number;
  mobs?: {
    mobTypeId: number;
    instanceId: string;
    position: Position;
    hp: number;
    status: 'alive' | 'dead';
  }[];
  items?: Item[];
}