// backend/db/inspect-schema.ts
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
  ssl: { rejectUnauthorized: false }
});

async function inspectSchema() {
  const client = await pool.connect();
  const schemaInfo: any = {};
  
  try {
    console.log('Inspecting database schema...');
    
    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log(`Found ${tables.length} tables: ${tables.join(', ')}`);
    
    // Get columns for each table
    for (const table of tables) {
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await client.query(columnsQuery, [table]);
      schemaInfo[table] = columnsResult.rows;
      
      console.log(`Table ${table} has ${columnsResult.rows.length} columns`);
    }
    
    // Write schema info to file
    const outputPath = path.resolve(__dirname, 'schema-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(schemaInfo, null, 2));
    
    console.log(`Schema information written to ${outputPath}`);
    
    return schemaInfo;
  } catch (error) {
    console.error('Error inspecting schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  inspectSchema().catch(console.error);
}

export default inspectSchema;