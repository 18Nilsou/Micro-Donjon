import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export const getPool = () => pool;

export const initDatabase = async (): Promise<void> => {
  const maxRetries = 10;
  const retryDelay = 3000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'mariadb-auth',
        port: Number.parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'auth_user',
        password: process.env.DB_PASSWORD || 'auth_password',
        database: process.env.DB_NAME || 'auth_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test connection
      const connection = await pool.getConnection();
      console.log('Connected to MariaDB');
      
      // Create users table if not exists
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          hero_id VARCHAR(36) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Users table ready');
      connection.release();
      return;
    } catch (error) {
      console.log(`Database connection attempt ${i + 1}/${maxRetries} failed. Retrying in ${retryDelay / 1000}s...`);
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};
