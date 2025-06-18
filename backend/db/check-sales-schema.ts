// backend/db/check-sales-schema.ts
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

async function checkSalesSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Checking sales table schema...');
    
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
      WHERE table_schema = 'public' AND table_name = 'sales'
      ORDER BY ordinal_position
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('Sales table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_generated === 'ALWAYS' ? '(GENERATED ALWAYS AS ' + col.generation_expression + ')' : ''}`);
    });
    
    // Check table definition directly
    const tableDefQuery = `
      SELECT pg_get_tabledef('sales'::regclass);
    `;
    
    try {
      const tableDefResult = await client.query(tableDefQuery);
      console.log('\nTable definition:');
      console.log(tableDefResult.rows[0].pg_get_tabledef);
    } catch (error) {
      console.log('Could not get table definition, function pg_get_tabledef may not exist');
      
      // Alternative approach
      const tableDefAltQuery = `
        SELECT
          a.attname as column_name,
          pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
          CASE WHEN a.attgenerated = 's' THEN pg_get_expr(d.adbin, d.adrelid) ELSE NULL END as generation_expression
        FROM pg_catalog.pg_attribute a
        LEFT JOIN pg_catalog.pg_attrdef d ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
        WHERE a.attrelid = 'sales'::regclass
        AND a.attnum > 0
        AND NOT a.attisdropped
        ORDER BY a.attnum;
      `;
      
      const tableDefAltResult = await client.query(tableDefAltQuery);
      console.log('\nTable columns with expressions:');
      tableDefAltResult.rows.forEach(col => {
        if (col.generation_expression) {
          console.log(`${col.column_name}: ${col.data_type} GENERATED ALWAYS AS (${col.generation_expression}) STORED`);
        }
      });
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
    
    console.log(`\nSample INSERT statement:\nINSERT INTO sales (${insertColumns}) VALUES (${placeholders})`);
    
  } catch (error) {
    console.error('Error checking sales schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
checkSalesSchema().catch(console.error);