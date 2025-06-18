import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
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

// Main setup function
async function setupAdminSchema() {
  console.log('Starting admin schema setup...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Read admin schema
    console.log('Applying admin schema...');
    const schemaPath = path.join(__dirname, 'admin-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema in a transaction
    try {
      await client.query('BEGIN');
      await client.query(schemaSql);
      await client.query('COMMIT');
      console.log('Admin schema applied successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error applying admin schema:', error);
      throw error;
    } finally {
      client.release();
    }
    
    console.log('Admin setup completed successfully!');
  } catch (error) {
    console.error('Error setting up admin schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup
setupAdminSchema().catch(console.error);