import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'fuelsync-server.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'fueladmin',
  password: process.env.DB_PASSWORD || 'Th1nkpad!2304',
  database: process.env.DB_NAME || 'fuelsync_db',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Get list of applied migrations
    const appliedMigrationsResult = await client.query('SELECT name FROM migrations');
    const appliedMigrations = appliedMigrationsResult.rows.map(row => row.name);
    
    // Get migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order
    
    // Run migrations that haven't been applied yet
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        console.log(`Applying migration: ${file}`);
        
        // Read migration file
        const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        
        // Run migration within a transaction
        await client.query('BEGIN');
        
        try {
          await client.query(migration);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Successfully applied migration: ${file}`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Failed to apply migration ${file}:`, error);
          throw error;
        }
      }
    }
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();