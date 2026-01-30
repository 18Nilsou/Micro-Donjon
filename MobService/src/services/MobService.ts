import { Mob } from "../domain/models/Mob";
import { NotFoundError } from "../domain/errors/NotFoundError";

export class MobService {

    private mobs: Mob[] = [];

    list(): Mob[] {
        if (this.mobs.length === 0) {
            const mobsData = require('../../data/mobs_data.json');
            this.mobs = mobsData;
        }
        return this.mobs;
    }

    getByType(type: 'Common' | 'Boss'): Mob[] {
        if (this.mobs.length === 0) {
            this.list();
        }
        const filteredMobs = this.mobs.filter(mob => mob.type === type);

        if (filteredMobs.length === 0) {
            throw new NotFoundError(`No mobs found of type: ${type}`);
        }
        return filteredMobs;
    }
}