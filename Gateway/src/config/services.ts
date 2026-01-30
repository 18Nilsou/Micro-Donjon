export interface Services {
  GAME_ENGINE: string;
  HERO: string;
  DUNGEON: string;
  ITEM: string;
  MOB: string;
  LOG: string;
}

export const SERVICES: Services = {
  GAME_ENGINE: process.env.GAME_ENGINE_URL || 'http://game-engine:3001',
  HERO: process.env.HERO_SERVICE_URL || 'http://hero-service:3002',
  DUNGEON: process.env.DUNGEON_SERVICE_URL || 'http://dungeon-service:3003',
  ITEM: process.env.ITEM_SERVICE_URL || 'http://item-service:3004',
  MOB: process.env.MOB_SERVICE_URL || 'http://mob-service:3006',
  LOG: process.env.LOG_SERVICE_URL || 'http://log-service:3005',
};
