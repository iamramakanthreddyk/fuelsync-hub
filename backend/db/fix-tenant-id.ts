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
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixTenantId() {
  console.log('Starting tenant_id fix...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Get all tenants
    const tenantsResult = await client.query('SELECT id, name FROM tenants');
    const tenants = tenantsResult.rows;
    
    console.log(`Found ${tenants.length} tenants`);
    
    // Fix tenant_id for each tenant schema
    for (const tenant of tenants) {
      const tenantId = tenant.id;
      const tenantName = tenant.name;
      const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
      
      console.log(`\nFixing tenant_id for ${tenantName} (${tenantId}) in schema ${schemaName}`);
      
      // Check if schema exists
      const schemaResult = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = $1
      `, [schemaName]);
      
      if (schemaResult.rows.length === 0) {
        console.error(`❌ Schema ${schemaName} does not exist!`);
        continue;
      }
      
      // Check if stations table exists
      const tableResult = await client.query(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name = 'stations'
      `, [schemaName]);
      
      if (tableResult.rows.length === 0) {
        console.error(`❌ Table stations does not exist in schema ${schemaName}!`);
        continue;
      }
      
      // Update tenant_id in stations table
      try {
        await client.query(`
          UPDATE "${schemaName}".stations 
          SET tenant_id = $1 
          WHERE tenant_id IS NULL
        `, [tenantId]);
        
        console.log(`✅ Fixed tenant_id in ${schemaName}.stations`);
      } catch (error) {
        console.error(`❌ Error fixing tenant_id in ${schemaName}.stations:`, error);
      }
      
      // Check if any stations still have NULL tenant_id
      const nullCheckResult = await client.query(`
        SELECT COUNT(*) FROM "${schemaName}".stations 
        WHERE tenant_id IS NULL
      `);
      
      const nullCount = parseInt(nullCheckResult.rows[0].count);
      if (nullCount > 0) {
        console.error(`❌ There are still ${nullCount} stations with NULL tenant_id in ${schemaName}`);
      } else {
        console.log(`✅ All stations in ${schemaName} have tenant_id set`);
      }
    }
    
    client.release();
    console.log('\nTenant ID fix completed!');
  } catch (error) {
    console.error('Error fixing tenant_id:', error);
  } finally {
    await pool.end();
  }
}

fixTenantId().catch(console.error);