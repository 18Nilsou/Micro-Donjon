import { Item } from "../domains/model/Item";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../domains/errors/NotFoundError";
import { dbConfig } from "../config/dataBase";
import { logPublisher } from "../config/logPublisher";
import { Pool } from "pg";

export class ItemService {

  private pool: Pool;

  constructor() {
    this.pool = new Pool(dbConfig);
  }

  async get(uuid: string): Promise<Item> {
    const query = `SELECT i.uuid, i.name, i.effect, i.value, i.description, i.rarity, i.item_type
                   FROM items i
                   WHERE i.uuid = $1`;
    const { rows } = await this.pool.query(query, [uuid]);

    if (rows.length === 0) {
      throw new NotFoundError('Item not found');
    }

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_RETRIEVED', { itemId: uuid });
    }

    const row = rows[0];
    return {
      uuid: row.uuid,
      name: row.name,
      effect: row.effect,
      value: row.value,
      description: row.description,
      rarity: row.rarity,
      itemType: row.item_type,
    };
  }

  async list(): Promise<Item[]> {
    const query = `SELECT i.uuid, i.name, i.effect, i.value, i.description, i.rarity, i.item_type
                   FROM items i`;
    const { rows } = await this.pool.query(query);

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_RETRIEVED', { itemId: "all" });
    }

    return rows.map(row => ({
      uuid: row.uuid,
      name: row.name,
      effect: row.effect,
      value: row.value,
      description: row.description,
      rarity: row.rarity,
      itemType: row.item_type,
    }));
  }

  async create(item: Item): Promise<Item> {
    const query = `INSERT INTO items (uuid, name, effect, value, description, rarity, item_type)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)
                   RETURNING uuid, name, effect, value, description, rarity, item_type`;
    const uuid = uuidv4();
    const values = [
      uuid,
      item.name,
      item.effect,
      item.value,
      item.description || null,
      item.rarity,
      item.itemType
    ];

    const { rows } = await this.pool.query(query, values);
    const row = rows[0];

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_CREATED', { itemId: row.uuid });
    }

    return {
      uuid: row.uuid,
      name: row.name,
      effect: row.effect,
      value: row.value,
      description: row.description,
      rarity: row.rarity,
      itemType: row.item_type,
    };
  }

  async update(uuid: string, item: Item): Promise<Item> {
    const query = `UPDATE items
                   SET name = $1, effect = $2, value = $3, description = $4, rarity = $5, item_type = $6
                   WHERE uuid = $7
                   RETURNING uuid, name, effect, value, description, rarity, item_type`;
    const values = [
      item.name,
      item.effect,
      item.value,
      item.description || null,
      item.rarity,
      item.itemType,
      uuid
    ];

    const { rows } = await this.pool.query(query, values);

    if (rows.length === 0) {
      throw new NotFoundError('Item not found');
    }

    const row = rows[0];

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_UPDATED', { itemId: row.uuid });
    }

    return {
      uuid: row.uuid,
      name: row.name,
      effect: row.effect,
      value: row.value,
      description: row.description,
      rarity: row.rarity,
      itemType: row.item_type,
    };
  }

  async delete(uuid: string): Promise<boolean> {
    const query = `DELETE FROM items WHERE uuid = $1 RETURNING uuid`;
    const { rows } = await this.pool.query(query, [uuid]);

    if (rows.length === 0) {
      throw new NotFoundError('Item not found');
    }

    if (logPublisher) {
      await logPublisher.logItemEvent('ITEMS_DELETED', { itemId: uuid });
    }

    return true;
  }
}
