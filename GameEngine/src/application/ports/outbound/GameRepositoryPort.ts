import { Game } from '../../../domain/models/Game';

export interface GameRepositoryPort {
  save(game: Game): Promise<void>;
  findById(id: string): Promise<Game | null>;
  update(id: string, game: Partial<Game>): Promise<void>;
  delete(id: string): Promise<void>;
}