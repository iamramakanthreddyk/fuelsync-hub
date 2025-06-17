import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const execPromise = promisify(exec);

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
  ssl: {
    rejectUnauthorized: false
  }
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
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema in a transaction
    try {
      await client.query(schemaSql);
      console.log('Schema applied successfully!');
    } catch (error) {
      console.error('Error applying schema:', error);
      throw error;
    } finally {
      client.release();
    }
    
    // Run seed script
    console.log('Running seed script...');
    try {
      await execPromise('npx ts-node db/seed.ts');
      console.log('Seed data applied successfully!');
    } catch (seedError) {
      console.error('Error seeding database:', seedError);
      throw seedError;
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