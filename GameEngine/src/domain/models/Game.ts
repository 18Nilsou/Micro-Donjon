import { Position } from './Position';
import { Item } from './Item';
import { Mob } from './Mob';
import { Fight } from './Fight';

export interface Game {
  id: string;
  heroId: string;
  dungeonId: string;
  currentRoomId: string;
  heroPosition?: Position;
  currentFightId?: string;
  currentFight?: Fight;
  status: 'active' | 'paused' | 'completed' | 'failed';
  startTime?: string;
  lastUpdate?: string;
  score?: number;
  mobs?: Mob[];
  items?: Item[];
}