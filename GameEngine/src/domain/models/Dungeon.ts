import { Room } from './Room';

export interface Dungeon {
  id: string;
  name: string;
  rooms: Room[];
  createdAt?: string;
}