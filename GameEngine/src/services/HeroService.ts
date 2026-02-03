import axios from 'axios';
import { GameService } from './GameService';
import { DungeonService } from './DungeonService';
import { MobService } from './MobService';
import { FightService } from './FightService';
import { logPublisher } from '../config/logPublisher';
import { Hero } from '../domain/models/Hero';
import { MoveResponse } from '../domain/models/MoveResponse';
import { Fight } from '../domain/models/Fight';
import { v4 as uuidv4 } from 'uuid';

export class HeroService {

  private baseUrl: string = process.env.HERO_SERVICE_URL || 'http://localhost:3005';
  private encounterChance: number = 0.05; // 5% chance of encounter per move

  constructor(
    private readonly gameService: GameService,
    private readonly dungeonService: DungeonService,
    private readonly mobService: MobService,
    private readonly fightService: FightService
  ) { }

  async moveHero(heroId: string, x: number, y: number): Promise<MoveResponse> {
    const game = await this.gameService.findById('current');
    if (!game) throw new Error('No current game');

    // Check if player is in a fight - movement is blocked during combat
    if (game.currentFightId) {
      return { success: true, position: game.heroPosition, roomId: game.currentRoomId };
    }

    // Get the dungeon to check room transitions
    const dungeon = await this.dungeonService.getDungeon(game.dungeonId);
    const currentRoom = dungeon.rooms.find(room => room.id === game.currentRoomId);

    if (!currentRoom) throw new Error('Current room not found');

    // Validate room boundaries - if out of bounds, return current position without error
    const roomWidth = currentRoom.dimension?.width || 10;
    const roomHeight = currentRoom.dimension?.height || 10;

    if (x < 0 || x >= roomWidth || y < 0 || y >= roomHeight) {
      return { success: true, position: game.heroPosition, roomId: game.currentRoomId };
    }

    const newPosition = { x, y };

    // Check if hero is moving to exit -> go to next room
    if (currentRoom.exit && currentRoom.exit.x === x && currentRoom.exit.y === y) {
      const nextRoom = dungeon.rooms.find(room => room.order === currentRoom.order + 1);
      if (nextRoom) {
        game.currentRoomId = nextRoom.id;
        game.heroPosition = nextRoom.entrance;
        await Promise.all([
          this.gameService.save(game),
          this.gameService.save({ ...game, id: 'current' })
        ]);

        if (logPublisher) {
          await logPublisher.logGameEvent('ROOM_CHANGED', { heroJson: 'all', newRoom: nextRoom.order });
        }

        return { success: true, position: nextRoom.entrance, roomId: nextRoom.id };
      }
    }

    // Check if hero is moving to entrance -> go to previous room
    if (currentRoom.entrance && currentRoom.entrance.x === x && currentRoom.entrance.y === y) {
      const prevRoom = dungeon.rooms.find(room => room.order === currentRoom.order - 1);
      if (prevRoom) {
        game.currentRoomId = prevRoom.id;
        game.heroPosition = prevRoom.exit;
        await Promise.all([
          this.gameService.save(game),
          this.gameService.save({ ...game, id: 'current' })
        ]);

        if (logPublisher) {
          await logPublisher.logGameEvent('ROOM_CHANGED', { heroJson: 'all', newRoom: prevRoom.order });
        }

        return { success: true, position: prevRoom.exit, roomId: prevRoom.id };
      }
    }

    // Normal movement within the room
    game.heroPosition = newPosition;
    await Promise.all([
      this.gameService.save(game),
      this.gameService.save({ ...game, id: 'current' })
    ]);

    if (logPublisher) {
      await logPublisher.logGameEvent('HERO_MOVED', { heroJson: 'all' });
    }

    // Check for random encounter
    const encounterRoll = Math.random();
    if (encounterRoll < this.encounterChance) {
      try {
        // Get all available mobs
        const allMobs = await this.mobService.getMobsByType('Common');
        if (allMobs && allMobs.length > 0) {
          // Select a random mob template
          const randomMobTemplate = allMobs[Math.floor(Math.random() * allMobs.length)];

          // Create mob instance in game state
          const mobId = (game.mobs ? game.mobs.length : 0) + 1;
          game.mobs = game.mobs || [];
          const mobMaxHp = randomMobTemplate.healthPoints || 20;
          game.mobs.push({
            id: mobId,
            position: newPosition,
            healthPoints: mobMaxHp,
            healthPointsMax: mobMaxHp,
            name: randomMobTemplate.name,
            attackPoints: randomMobTemplate.attackPoints || 5,
            status: 'alive'
          });

          // Create a fight
          const fight: Fight = {
            id: uuidv4(),
            heroId: game.heroId,
            mobIds: [mobId],
            status: 'active',
            turn: 'hero',
            turnNumber: 1,
            startTime: new Date().toISOString()
          };

          // Save fight to service
          const createdFight = await this.fightService.startFight(fight);

          // Update game with current fight (need to set both ID and object)
          game.currentFightId = fight.id;
          game.currentFight = createdFight;
          await Promise.all([
            this.gameService.save(game),
            this.gameService.save({ ...game, id: 'current' })
          ]);

          if (logPublisher) {
            await logPublisher.logGameEvent('ENCOUNTER', {
              heroJson: 'all',
              mobId: randomMobTemplate.id,
              fightId: fight.id
            });
          }

          return {
            success: true,
            position: newPosition,
            roomId: game.currentRoomId,
            encounter: {
              happened: true,
              fight: createdFight,
              mob: game.mobs[game.mobs.length - 1] // Return the mob instance data
            }
          };
        }
      } catch (error) {
        console.error('Failed to create encounter:', error);
        // Continue without encounter if something fails
      }
    }

    return { success: true, position: newPosition, roomId: game.currentRoomId };
  }

  async getHero(id: string): Promise<Hero> {
    const response = await axios.get(`${this.baseUrl}/heroes/${id}`);
    return response.data;
  }
}