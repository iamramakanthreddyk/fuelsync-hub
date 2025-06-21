import { Pool } from 'pg';
import { newDb } from 'pg-mem';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let pool: Pool;

if (process.env.NODE_ENV === 'test' || process.env.USE_PG_MEM === 'true') {
  const mem = newDb();
  const adapters = mem.adapters.createPg();
  const MemPool = adapters.Pool;
  pool = new MemPool();
} else {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
}
export default pool;
