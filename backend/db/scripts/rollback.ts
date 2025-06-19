import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

async function rollback() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get last batch number
    const { rows: [{ last_batch }] } = await client.query(`
      SELECT MAX(batch) as last_batch FROM migrations
    `);

    if (!last_batch) {
      console.log('No migrations to roll back');
      return;
    }

    // Get migrations from last batch
    const { rows: migrations } = await client.query(
      'SELECT name FROM migrations WHERE batch = $1 ORDER BY id DESC',
      [last_batch]
    );

    // Delete migrations from last batch
    await client.query(
      'DELETE FROM migrations WHERE batch = $1',
      [last_batch]
    );

    await client.query('COMMIT');
    console.log(`✅ Rolled back batch ${last_batch}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.release();
    await pool.end();
  }
}

rollback().catch(console.error);
