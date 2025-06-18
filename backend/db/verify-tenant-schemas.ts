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

async function verifyTenantSchemas() {
  console.log('Verifying tenant schemas...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Get tenant IDs
    const tenantsResult = await client.query('SELECT id, name FROM tenants');
    const tenants = tenantsResult.rows;
    
    console.log(`Found ${tenants.length} tenants`);
    
    // Check schemas for each tenant
    for (const tenant of tenants) {
      const tenantId = tenant.id;
      const tenantName = tenant.name;
      const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
      
      console.log(`\nVerifying schema for tenant ${tenantName} (${tenantId}): ${schemaName}`);
      
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
      
      console.log(`✅ Schema ${schemaName} exists`);
      
      // Check if enum types exist
      const enumTypes = [
        'user_role', 'station_user_role', 'payment_method', 'sale_status',
        'subscription_plan', 'tenant_status', 'fuel_type', 'creditor_payment_method',
        'shift_status', 'tender_type'
      ];
      
      console.log('\nChecking enum types:');
      
      for (const enumType of enumTypes) {
        const enumResult = await client.query(`
          SELECT 1 FROM pg_type 
          WHERE typname = $1 
          AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = $2)
        `, [enumType, schemaName]);
        
        if (enumResult.rows.length === 0) {
          console.error(`❌ Enum type ${enumType} does not exist in ${schemaName}`);
        } else {
          console.log(`✅ Enum type ${enumType} exists in ${schemaName}`);
        }
      }
      
      // Check if tables exist
      const tables = [
        'users', 'stations', 'user_stations', 'pumps', 'nozzles', 'nozzle_readings',
        'creditors', 'fuel_price_history', 'sales', 'creditor_payments',
        'shifts', 'tender_entries', 'day_reconciliations'
      ];
      
      console.log('\nChecking tables:');
      
      for (const table of tables) {
        const tableResult = await client.query(`
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = $2
        `, [schemaName, table]);
        
        if (tableResult.rows.length === 0) {
          console.error(`❌ Table ${table} does not exist in ${schemaName}`);
        } else {
          console.log(`✅ Table ${table} exists in ${schemaName}`);
        }
      }
      
      // Check if functions exist
      const functions = [
        'round_decimal', 'calc_sale_amount', 'update_fuel_price_effective_to'
      ];
      
      console.log('\nChecking functions:');
      
      for (const func of functions) {
        const funcResult = await client.query(`
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE p.proname = $1 
          AND n.nspname = $2
        `, [func, schemaName]);
        
        if (funcResult.rows.length === 0) {
          console.error(`❌ Function ${func} does not exist in ${schemaName}`);
        } else {
          console.log(`✅ Function ${func} exists in ${schemaName}`);
        }
      }
      
      // Check if triggers exist
      console.log('\nChecking triggers:');
      
      const triggerResult = await client.query(`
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'set_fuel_price_effective_to'
        AND n.nspname = $1
      `, [schemaName]);
      
      if (triggerResult.rows.length === 0) {
        console.error(`❌ Trigger set_fuel_price_effective_to does not exist in ${schemaName}`);
      } else {
        console.log(`✅ Trigger set_fuel_price_effective_to exists in ${schemaName}`);
      }
    }
    
    client.release();
    console.log('\nTenant schema verification completed!');
  } catch (error) {
    console.error('Error verifying tenant schemas:', error);
  } finally {
    await pool.end();
  }
}

verifyTenantSchemas().catch(console.error);