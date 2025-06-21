import { newDb } from 'pg-mem';

const mem = newDb();
mem.public.none(`CREATE TABLE test_items (id uuid PRIMARY KEY, name text not null);`);
const { Pool: MemPool } = mem.adapters.createPg();
const pool = new MemPool();

jest.mock('../../backend/src/config/database', () => ({
  __esModule: true,
  default: pool,
}));

import { insertWithUUID } from '../../backend/src/services/db.service';

afterAll(async () => {
  await pool.end();
});

describe('insertWithUUID', () => {
  it('inserts a record and returns it', async () => {
    const row = await insertWithUUID(null, 'test_items', { name: 'Alpha' }, '*');
    const result = await pool.query('SELECT name FROM test_items WHERE id = $1', [row.id]);
    expect(result.rows[0].name).toBe('Alpha');
  });
});
