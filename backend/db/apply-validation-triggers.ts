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

// Main function to apply validation triggers
async function applyValidationTriggers() {
  console.log('Starting to apply validation triggers...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Read validation triggers SQL
    console.log('Reading validation triggers SQL...');
    const triggersPath = path.join(__dirname, 'validation-triggers.sql');
    const triggersSql = fs.readFileSync(triggersPath, 'utf8');
    
    // Execute triggers in a transaction
    try {
      console.log('Applying validation triggers...');
      await client.query('BEGIN');
      
      // First, drop existing triggers if they exist
      console.log('Dropping existing triggers...');
      await client.query(`
        DROP TRIGGER IF EXISTS check_tenant_owner_trigger ON tenants;
        DROP TRIGGER IF EXISTS check_tenant_station_trigger ON tenants;
        DROP TRIGGER IF EXISTS check_station_pump_trigger ON stations;
        DROP TRIGGER IF EXISTS check_station_users_trigger ON stations;
        DROP TRIGGER IF EXISTS check_pump_nozzles_trigger ON pumps;
        DROP TRIGGER IF EXISTS validate_fuel_type_trigger ON nozzles;
        DROP TRIGGER IF EXISTS validate_payment_method_trigger ON sales;
      `);
      
      // Then apply the new triggers
      await client.query(triggersSql);
      
      await client.query('COMMIT');
      console.log('Validation triggers applied successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error applying validation triggers:', error);
      throw error;
    } finally {
      client.release();
    }
    
    console.log('Validation triggers setup completed successfully!');
  } catch (error) {
    console.error('Error setting up validation triggers:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the function
applyValidationTriggers().catch(console.error);