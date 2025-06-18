// backend/db/check-creditors-schema.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function checkCreditorsSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Checking creditors table schema...');
    
    // Get detailed column info
    const columnsQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        is_identity,
        is_generated,
        generation_expression
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'creditors'
      ORDER BY ordinal_position
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('Creditors table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_generated === 'ALWAYS' ? '(GENERATED ALWAYS AS ' + col.generation_expression + ')' : ''}`);
    });
    
    // Check for required columns
    const requiredColumns = ['id', 'party_name'];
    const missingColumns = requiredColumns.filter(col => 
      !columnsResult.rows.some(dbCol => dbCol.column_name === col)
    );
    
    if (missingColumns.length > 0) {
      console.log(`\nMissing required columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('\nAll required columns are present');
    }
    
    // Create a simple insert statement
    console.log('\nCreating a test insert statement...');
    
    // Get non-generated columns
    const nonGeneratedColumns = columnsResult.rows
      .filter(col => col.is_generated !== 'ALWAYS')
      .map(col => col.column_name);
    
    console.log('Non-generated columns:', nonGeneratedColumns);
    
    // Create a simple insert statement
    const insertColumns = nonGeneratedColumns.join(', ');
    const placeholders = nonGeneratedColumns.map((_, i) => `$${i + 1}`).join(', ');
    
    console.log(`\nSample INSERT statement:\nINSERT INTO creditors (${insertColumns}) VALUES (${placeholders})`);
    
  } catch (error) {
    console.error('Error checking creditors schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
checkCreditorsSchema().catch(console.error);