import fs from 'fs/promises';
import path from 'path';
import pool from '../dbPool';

async function generateSchemaSnapshot() {

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
