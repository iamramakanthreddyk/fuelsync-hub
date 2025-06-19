import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function generateSchemaSnapshot() {
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

  try {
    const { rows } = await pool.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        column_default,
        is_nullable,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    const snapshot = rows.reduce((acc, row) => {
      if (!acc[row.table_name]) acc[row.table_name] = [];
      acc[row.table_name].push(row);
      return acc;
    }, {});

    await fs.writeFile(
      path.join(__dirname, '../schema/schema.json'),
      JSON.stringify(snapshot, null, 2)
    );

    console.log('✅ Schema snapshot generated');
  } finally {
    await pool.end();
  }
}

generateSchemaSnapshot().catch(console.error);
