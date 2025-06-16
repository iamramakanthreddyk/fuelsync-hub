import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { generateUUID } from '../../src/utils/uuid';

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
          
          // If this is the public schema migration, add default data with UUIDs
          if (file === '01_public_schema.sql') {
            await seedDefaultData(client);
          }
          
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

async function seedDefaultData(client: any) {
  console.log('Seeding default data...');
  
  // Insert plans with UUIDs
  const basicPlanId = generateUUID();
  const premiumPlanId = generateUUID();
  const enterprisePlanId = generateUUID();
  
  await client.query(`
    INSERT INTO plans (id, name, max_stations, max_employees, price_monthly, price_yearly, features)
    VALUES 
    ($1, 'basic', 1, 5, 29.99, 299.90, '{"reports": ["basic"], "support": "email"}'),
    ($2, 'premium', 5, 20, 99.99, 999.90, '{"reports": ["basic", "advanced"], "support": "priority"}'),
    ($3, 'enterprise', 999, 999, 299.99, 2999.90, '{"reports": ["basic", "advanced", "custom"], "support": "dedicated", "api_access": true}')
  `, [basicPlanId, premiumPlanId, enterprisePlanId]);
  
  // Insert plan features
  await client.query(`
    INSERT INTO plan_features (plan_type, max_stations, max_employees, enable_creditors, enable_reports, enable_analytics, enable_api_access, support_level)
    VALUES
    ('basic', 1, 5, true, true, false, false, 'standard'),
    ('premium', 5, 20, true, true, true, false, 'priority'),
    ('enterprise', 999, 999, true, true, true, true, 'dedicated')
  `);
  
  // Create default admin
  const adminId = generateUUID();
  const adminPassword = '$2b$10$1Yk9A87Kz.8BtGxU7sC4WeiR6VBUhB8mPBHWS/Vys8GXwqKWsKEBa'; // "admin123"
  
  await client.query(`
    INSERT INTO admin_users (id, email, password_hash, first_name, last_name, role, active)
    VALUES ($1, 'admin@fuelsync.com', $2, 'System', 'Admin', 'superadmin', true)
  `, [adminId, adminPassword]);
  
  console.log('Default data seeded successfully');
}

runMigrations();