import { newDb } from 'pg-mem';

export const db = newDb();
const { Pool: MemPool } = db.adapters.createPg();
export const pool = new MemPool();

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.USE_PG_MEM = 'true';
  db.public.none(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id uuid PRIMARY KEY,
      email text not null,
      password_hash text not null,
      role text not null,
      first_name text,
      last_name text
    );
  `);
});

beforeEach(async () => {
  await pool.query('DELETE FROM admin_users');
  await pool.query(`INSERT INTO admin_users (id, email, password_hash, role, first_name, last_name)
                   VALUES ('11111111-1111-1111-1111-111111111111', 'admin@fuelsync.com', 'hash', 'superadmin', 'Admin', 'User')`);
});

afterAll(async () => {
  await pool.end();
});
