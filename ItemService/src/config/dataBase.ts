import { Pool } from 'pg';

export const dbConfig = {
  user: process.env.DB_USERNAME || 'user',
  host: process.env.DB_HOST || 'postgres-items',
  database: process.env.DB_DATABASE || 'items_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
};

export async function init() {
  const pool = new Pool(dbConfig);

  await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
          uuid VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          value INTEGER NOT NULL DEFAULT 0,
          rarity VARCHAR(50) NOT NULL DEFAULT 'Common',
          effect VARCHAR(100) NOT NULL,
          item_type VARCHAR(100) NOT NULL
      );
  `);
}


export async function destroy() {
  // Any cleanup logic if needed
}
