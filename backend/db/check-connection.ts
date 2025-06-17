import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Display connection parameters (without password)
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

async function checkConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Get PostgreSQL version
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Check if we can create a table
    try {
      await client.query('CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
      console.log('Successfully created test table');
      
      // Insert a record
      await client.query('INSERT INTO connection_test (test_date) VALUES (CURRENT_TIMESTAMP)');
      console.log('Successfully inserted test record');
      
      // Query the record
      const testResult = await client.query('SELECT * FROM connection_test ORDER BY test_date DESC LIMIT 1');
      console.log('Successfully queried test record:', testResult.rows[0]);
      
      // Clean up
      await client.query('DROP TABLE connection_test');
      console.log('Successfully cleaned up test table');
    } catch (testError) {
      console.error('Error during table test:', testError);
    }
    
    client.release();
  } catch (error) {
    console.error('Connection error:', error);
  } finally {
    await pool.end();
  }
}

checkConnection();