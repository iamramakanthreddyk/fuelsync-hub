import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Log connection parameters (without password)
console.log('Database connection parameters:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`SSL: ${process.env.DB_SSL}`);

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Main setup function
async function setupDatabase() {
  console.log('Starting database setup...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Read schema.sql
    console.log('Applying database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Comment out the DROP SCHEMA line to prevent dropping the public schema
    schemaSql = schemaSql.replace('DROP SCHEMA IF EXISTS public CASCADE;', '-- DROP SCHEMA IF EXISTS public CASCADE;');
    
    // Execute schema in a transaction
    try {
      await client.query('BEGIN');
      await client.query(schemaSql);
      await client.query('COMMIT');
      console.log('Schema applied successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error applying schema:', error);
      throw error;
    } finally {
      client.release();
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup
setupDatabase().catch(console.error);