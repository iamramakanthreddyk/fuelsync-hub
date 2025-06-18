// backend/db/migrate.ts
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database connection
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

// Migration directory
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Parse command line arguments
const args = process.argv.slice(2);
const toVersion = args.indexOf('--to') !== -1 ? args[args.indexOf('--to') + 1] : null;
const isRollback = args.indexOf('--rollback') !== -1;
const showStatus = args.indexOf('--status') !== -1;

// Create a hash of the migration file content
function createChecksum(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Ensure migrations table exists
async function ensureMigrationsTable(client: any): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      checksum VARCHAR(32) NOT NULL
    );
  `);
}

// Get applied migrations
async function getAppliedMigrations(client: any): Promise<string[]> {
  const result = await client.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map((row: any) => row.name);
}

// Apply a migration
async function applyMigration(client: any, migrationFile: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, migrationFile);
  const content = fs.readFileSync(filePath, 'utf8');
  const checksum = createChecksum(content);
  
  // Extract UP section
  const upMatch = content.match(/-- UP\s+([\s\S]*?)(?:-- DOWN|$)/);
  if (!upMatch) {
    throw new Error(`Migration ${migrationFile} does not contain an UP section`);
  }
  
  const upSql = upMatch[1].trim();
  
  console.log(`Applying migration: ${migrationFile}`);
  
  try {
    // Execute the migration
    await client.query(upSql);
    
    // Record the migration
    await client.query(
      'INSERT INTO migrations (name, checksum) VALUES ($1, $2)',
      [migrationFile, checksum]
    );
    
    console.log(`Migration applied: ${migrationFile}`);
  } catch (error) {
    console.error(`Error applying migration ${migrationFile}:`, error);
    throw error;
  }
}

// Rollback a migration
async function rollbackMigration(client: any, migrationFile: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, migrationFile);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract DOWN section
  const downMatch = content.match(/-- DOWN\s+([\s\S]*?)(?:$)/);
  if (!downMatch) {
    throw new Error(`Migration ${migrationFile} does not contain a DOWN section`);
  }
  
  const downSql = downMatch[1].trim();
  
  console.log(`Rolling back migration: ${migrationFile}`);
  
  try {
    // Execute the rollback
    await client.query(downSql);
    
    // Remove the migration record
    await client.query('DELETE FROM migrations WHERE name = $1', [migrationFile]);
    
    console.log(`Migration rolled back: ${migrationFile}`);
  } catch (error) {
    console.error(`Error rolling back migration ${migrationFile}:`, error);
    throw error;
  }
}

// Show migration status
async function showMigrationStatus(client: any): Promise<void> {
  // Get all migration files
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  // Get applied migrations
  const appliedMigrations = await getAppliedMigrations(client);
  
  console.log('\nMigration Status:');
  console.log('=================');
  
  for (const file of migrationFiles) {
    const status = appliedMigrations.includes(file) ? 'Applied' : 'Pending';
    console.log(`[${status}] ${file}`);
  }
  
  console.log('\n');
}

// Main function
async function main(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Ensure migrations table exists
    await ensureMigrationsTable(client);
    
    // Show status if requested
    if (showStatus) {
      await showMigrationStatus(client);
      return;
    }
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations(client);
    
    if (isRollback) {
      // Rollback migrations
      const migrationsToRollback = [...appliedMigrations].reverse();
      
      if (toVersion) {
        // Rollback to specific version
        const versionIndex = migrationsToRollback.indexOf(toVersion);
        if (versionIndex === -1) {
          throw new Error(`Migration ${toVersion} not found or not applied`);
        }
        migrationsToRollback.splice(0, versionIndex);
      } else {
        // Rollback only the last migration
        migrationsToRollback.splice(1);
      }
      
      for (const migration of migrationsToRollback) {
        await rollbackMigration(client, migration);
      }
    } else {
      // Apply migrations
      const pendingMigrations = migrationFiles.filter(file => !appliedMigrations.includes(file));
      
      if (toVersion) {
        // Apply up to specific version
        const versionIndex = pendingMigrations.indexOf(toVersion);
        if (versionIndex === -1) {
          throw new Error(`Migration ${toVersion} not found or already applied`);
        }
        pendingMigrations.splice(versionIndex + 1);
      }
      
      for (const migration of pendingMigrations) {
        await applyMigration(client, migration);
      }
    }
    
    await client.query('COMMIT');
    
    // Show final status
    await showMigrationStatus(client);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);