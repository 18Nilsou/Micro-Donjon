import { Mob } from "../domain/models/Mob";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { logPublisher } from "../config/logPublisher";

export class MobService {

    async list(): Promise<Mob[]> {
        const mobs = require('../../data/mobs_data.json');

        if (logPublisher) {
            await logPublisher.logMobEvent('MOBS_RETRIEVED', { mobJson: "all" });
        }
        return mobs;
    }

    async getByType(type: 'Common' | 'Boss'): Promise<Mob[]> {
        const mobs = await this.list();
        const filteredMobs = mobs.filter(mob => mob.type === type);

        if (filteredMobs.length === 0) {
            if (logPublisher) {
                await logPublisher.logError('MOBS_GET_BY_TYPE', { type: type });
            }
            throw new NotFoundError(`No mobs found of type: ${type}`);
        }
        else if (logPublisher) {
            await logPublisher.logMobEvent('MOBS_GET_BY_TYPE', { mobType: type });
        }
        return filteredMobs;
    }

    async getById(id: number): Promise<Mob> {
        const mobs = await this.list();
        const mob = mobs.find(mob => mob.id === Number(id));

        if (!mob) {
            if (logPublisher) {
                await logPublisher.logError('MOBS_GET_BY_ID', { id: id });
            }
            throw new NotFoundError(`Mob with id ${id} not found.`);
        }
        else if (logPublisher) {
            await logPublisher.logMobEvent('MOB_GET_BY_ID', { mobId: id });
        }
        return mob;
    }
}