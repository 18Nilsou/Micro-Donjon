import { Mob } from "../domain/models/Mob";
import { NotFoundError } from "../domain/errors/NotFoundError";
import { logPublisher } from "../config/logPublisher";

export class MobService {

    private mobs: Mob[] = [];

    async list(): Promise<Mob[]> {
        if (this.mobs.length === 0) {
            const mobsData = require('../../data/mobs_data.json');
            this.mobs = mobsData;
        }
        if (logPublisher) {
            await logPublisher.logMobEvent('MOBS_RETRIEVED', { mobJson: "all" });
        }
        return this.mobs;
    }

    async getByType(type: 'Common' | 'Boss'): Promise<Mob[]> {
        if (this.mobs.length === 0) {
            await this.list();  // <-- Ajouter await ici
        }
        const filteredMobs = this.mobs.filter(mob => mob.type === type);

        if (filteredMobs.length === 0) {
            throw new NotFoundError(`No mobs found of type: ${type}`);
        }
        else if (logPublisher) {
            await logPublisher.logMobEvent('MOBS_GET_BY_TYPE', { type: type });
        }
        return filteredMobs;
    }
}