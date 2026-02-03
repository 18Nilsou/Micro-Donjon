import { Dungeon } from "../domain/models/Dungeon";
import { Room } from "../domain/models/Room";
import { Position } from "../domain/models/Position";
import { Dimension } from "../domain/models/Dimension";
import { RoomType } from "../domain/models/RoomType";
import { RoomConfig } from "../domain/models/RoomConfig";
import { BadRequestError } from "../domain/errors/BadRequestError";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { redisClient } from "../config/redis";
import { v4 as uuidv4 } from "uuid";
import { logPublisher } from "../config/logPublisher";

export class DungeonService {

    private readonly DUNGEONS_KEY: string;
    private readonly DUNGEON_PREFIX: string;

    private readonly ROOM_CONFIGS: Record<RoomType, RoomConfig> = {
        [RoomType.SMALL]: { minWidth: 5, maxWidth: 8, minHeight: 5, maxHeight: 8, weight: 3 },
        [RoomType.MEDIUM]: { minWidth: 8, maxWidth: 12, minHeight: 8, maxHeight: 12, weight: 4 },
        [RoomType.LARGE]: { minWidth: 12, maxWidth: 18, minHeight: 12, maxHeight: 18, weight: 2 },
        [RoomType.CORRIDOR]: { minWidth: 8, maxWidth: 12, minHeight: 3, maxHeight: 5, weight: 2 },
        [RoomType.HALL]: { minWidth: 15, maxWidth: 20, minHeight: 15, maxHeight: 20, weight: 1 }
    };

    private readonly MIN_ROOMS = 1;
    private readonly MAX_ROOMS = 20;

    constructor() {
        this.DUNGEONS_KEY = process.env.DUNGEONS_KEY || 'dungeons';
        this.DUNGEON_PREFIX = process.env.DUNGEON_PREFIX || 'dungeon:';
    }

    async list(): Promise<Dungeon[]> {
        const dungeonIds = await redisClient.sMembers(this.DUNGEONS_KEY);
        const dungeons: Dungeon[] = [];

        for (const id of dungeonIds) {
            const dungeonData = await this.getById(id);
            if (dungeonData) {
                dungeons.push(dungeonData);
            }
        }

        if (logPublisher) {
            await logPublisher.logDungeonEvent('DUNGEONS_LISTED', { count: dungeons.length });
        }

        return dungeons;
    }

    async insert(name: string, numberOfRooms: number): Promise<Dungeon> {
        const dungeon = await this.generateDungeon(name, numberOfRooms);
        if (logPublisher) {
            await logPublisher.logDungeonEvent('DUNGEON_INSERTED', { dungeonId: dungeon.id, name, numberOfRooms });
        }
        return dungeon;
    }

    async getById(id: string): Promise<Dungeon> {
        const dungeonData = await redisClient.get(`${this.DUNGEON_PREFIX}${id}`);

        if (!dungeonData) {
            throw new NotFoundError(`Dungeon with id ${id} not found.`);
        }

        if (logPublisher) {
            await logPublisher.logDungeonEvent('DUNGEON_RETRIEVED', { dungeonId: id });
        }

        return JSON.parse(dungeonData);
    }

    private random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private async selectRoomType(): Promise<RoomType> {
        const totalWeight = Object.values(this.ROOM_CONFIGS).reduce((sum, config) => sum + config.weight, 0);
        let randomWeight = Math.random() * totalWeight;

        for (const [type, config] of Object.entries(this.ROOM_CONFIGS)) {
            randomWeight -= config.weight;
            if (randomWeight <= 0) {
                if (logPublisher) {
                    await logPublisher.logDungeonEvent('ROOM_TYPE_SELECTED', { roomType: type });
                }
                return type as RoomType;
            }
        }

        if (logPublisher) {
            logPublisher.logError(new Error("Room type selection failed, defaulting to MEDIUM"), {});
        }
        return RoomType.MEDIUM;
    }

    private generateRoomDimension(roomType: RoomType): Dimension {
        const config = this.ROOM_CONFIGS[roomType];
        const width = this.random(config.minWidth, config.maxWidth);
        const height = this.random(config.minHeight, config.maxHeight);

        if (roomType === RoomType.CORRIDOR) {
            return Math.random() > 0.5
                ? { width: Math.max(width, height), height: Math.min(width, height) }
                : { width: Math.min(width, height), height: Math.max(width, height) };
        }

        return { width, height };
    }

    private generateEntrance(dimension: Dimension, isFirstRoom: boolean = false): Position {
        const wall = this.random(0, 3);

        switch (wall) {
            case 0: // Bottom wall
                if (dimension.width <= 2) return { x: 0, y: 0 };
                return { x: this.random(1, dimension.width - 2), y: 0 };
            case 1: // Right wall
                if (dimension.height <= 2) return { x: dimension.width - 1, y: 0 };
                return { x: dimension.width - 1, y: this.random(1, dimension.height - 2) };
            case 2: // Top wall
                if (dimension.width <= 2) return { x: 0, y: dimension.height - 1 };
                return { x: this.random(1, dimension.width - 2), y: dimension.height - 1 };
            case 3: // Left wall
                if (dimension.height <= 2) return { x: 0, y: 0 };
                return { x: 0, y: this.random(1, dimension.height - 2) };
            default:
                return { x: Math.floor(dimension.width / 2), y: 0 };
        }
    }

    private generateExit(dimension: Dimension, entrance: Position, isLastRoom: boolean = false): Position {
        let entranceWall = -1;
        if (entrance.y === 0) entranceWall = 0; // Bottom
        else if (entrance.x === dimension.width - 1) entranceWall = 1; // Right
        else if (entrance.y === dimension.height - 1) entranceWall = 2; // Top
        else if (entrance.x === 0) entranceWall = 3; // Left

        const oppositeWall = (entranceWall + 2) % 4;
        const adjacentWalls = [(entranceWall + 1) % 4, (entranceWall + 3) % 4];

        const exitWall = Math.random() > 0.3
            ? oppositeWall
            : adjacentWalls[this.random(0, 1)];

        switch (exitWall) {
            case 0: // Bottom wall
                if (dimension.width <= 2) return { x: 0, y: 0 };
                return { x: this.random(1, dimension.width - 2), y: 0 };
            case 1: // Right wall
                if (dimension.height <= 2) return { x: dimension.width - 1, y: 0 };
                return { x: dimension.width - 1, y: this.random(1, dimension.height - 2) };
            case 2: // Top wall
                if (dimension.width <= 2) return { x: 0, y: dimension.height - 1 };
                return { x: this.random(1, dimension.width - 2), y: dimension.height - 1 };
            case 3: // Left wall
                if (dimension.height <= 2) return { x: 0, y: 0 };
                return { x: 0, y: this.random(1, dimension.height - 2) };
            default:
                return { x: Math.floor(dimension.width / 2), y: dimension.height - 1 };
        }
    }

    private async generateRoom(order: number, totalRooms: number): Promise<Room> {
        const isFirstRoom = order === 0;
        const isLastRoom = order === totalRooms - 1;

        let roomType: RoomType;
        if (isLastRoom && totalRooms > 3) {
            roomType = this.random(0, 1) === 0 ? RoomType.HALL : RoomType.LARGE;
        } else if (order === Math.floor(totalRooms / 2) && totalRooms > 5) {
            roomType = RoomType.LARGE;
        } else {
            roomType = await this.selectRoomType();
        }

        const dimension = this.generateRoomDimension(roomType);
        const entrance = this.generateEntrance(dimension, isFirstRoom);
        const exit = this.generateExit(dimension, entrance, isLastRoom);
        if (logPublisher) {
            await logPublisher.logDungeonEvent('ROOM_GENERATED', {
                roomOrder: order,
                roomType,
                dimension,
                entrance,
                exit
            });
        }
        return {
            id: uuidv4(),
            dimension,
            entrance,
            exit,
            order
        };
    }

    private async generateDungeon(name: string, numberOfRooms: number): Promise<Dungeon> {
        const dungeon: Dungeon = { id: uuidv4(), name, rooms: [] };

        if (numberOfRooms < this.MIN_ROOMS) throw new BadRequestError("A dungeon must have at least one room.");
        if (numberOfRooms > this.MAX_ROOMS) throw new BadRequestError(`A dungeon cannot have more than ${this.MAX_ROOMS} rooms.`);

        const roomCount = numberOfRooms;

        for (let i = 0; i < roomCount; i++) {
            const room = await this.generateRoom(i, roomCount);
            dungeon.rooms.push(room);
        }

        await this.storeDungeon(dungeon);
        if (logPublisher) {
            await logPublisher.logDungeonEvent('DUNGEON_GENERATED', { dungeonId: dungeon.id, name, numberOfRooms });
        }
        return dungeon;
    }

    private async storeDungeon(dungeon: Dungeon): Promise<void> {
        await redisClient.sAdd(this.DUNGEONS_KEY, dungeon.id);

        await redisClient.set(
            `${this.DUNGEON_PREFIX}${dungeon.id}`,
            JSON.stringify(dungeon)
        );
    }
}