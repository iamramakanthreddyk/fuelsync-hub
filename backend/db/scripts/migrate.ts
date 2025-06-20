#!/usr/bin/env ts-node
import fs         from 'fs';
import path       from 'path';
import pool       from '../dbPool';

async function applyMigration(filePath: string, description: string) {
  const client = await pool.connect();
  try {
    console.log(`🔄 Applying ${description}...`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`✅ ${description} applied successfully`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ ${description} failed:`, err);
    throw err;
  } finally {
    client.release();
  }
}

async function migrate() {
  try {
    // First apply the complete schema
    const schemaPath = path.join(__dirname, '../schema/complete_schema.sql');
    await applyMigration(schemaPath, 'Complete schema');

    // Then apply any incremental migrations
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      await applyMigration(
        path.join(migrationsDir, file),
        `Migration ${file}`
      );
    }

    console.log('✅ All migrations completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);
