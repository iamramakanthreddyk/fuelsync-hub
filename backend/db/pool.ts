// src/db/pool.ts
import { Pool } from 'pg';
import { config } from '../src/config/environment';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: config.db.ssl ? {
    rejectUnauthorized: false
  } : undefined
});

export default pool;