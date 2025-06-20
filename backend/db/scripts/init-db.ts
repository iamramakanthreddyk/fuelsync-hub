#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import pool from '../dbPool';

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Initializing database...');

    // 1. Apply complete schema
    console.log('📊 Applying complete schema...');
    const schemaPath = path.join(__dirname, '../schema/complete_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schemaSql);

    // 2. Run any additional migrations
    console.log('🔄 Running migrations...');
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrations = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const migration of migrations) {
      console.log(`  ⚙️ Running migration: ${migration}`);
      const migrationPath = path.join(migrationsDir, migration);
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      await client.query(migrationSql);
    }

    // 3. Run seed script
    console.log('🌱 Seeding database...');
    const seedPath = path.join(__dirname, 'seed.ts');
    require(seedPath);

    console.log('✅ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
