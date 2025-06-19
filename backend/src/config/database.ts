// src/config/database.ts
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
const skipEnvLoad = process.env.CI === 'true' || process.env.CODEX_MODE === 'true' || process.env.HEADLESS === 'true';

if (!skipEnvLoad) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection and export pool
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

export default pool;