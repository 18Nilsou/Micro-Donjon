import { Game } from '../../../domain/models/Game';

export interface GameServicePort {
  startGame(heroId: number, dungeonId: string): Promise<Game>;
  getGame(): Promise<Game>;
  updateGame(updates: Partial<Game>): Promise<Game>;
  deleteGame(): Promise<void>;
}