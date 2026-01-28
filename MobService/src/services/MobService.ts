import { Mob } from "../domain/models/Mob";

export class MobService {

    mobs: Mob[] = [];

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
        return this.mobs.filter(mob => mob.type === type);
    }
}