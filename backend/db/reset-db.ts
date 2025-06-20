// backend/db/reset-db.ts - Reset database before seeding
import pool from './dbPool';

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Starting complete database reset...');
    
    // Get tenant schemas
    const schemasResult = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%'
    `);
    
    const schemas = schemasResult.rows.map(row => row.schema_name);
    
    // Drop tenant schemas
    for (const schema of schemas) {
      console.log(`🗑️ Dropping schema ${schema}...`);
      await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    }
    
    // Get all tables to understand the complete dependency chain
    console.log('🔍 Identifying all tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const allTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Found tables:', allTables.join(', '));
    
    // Delete data in dependency order (most dependent first)
    console.log('🗑️ Deleting data in dependency order...');
    
    const deletionOrder = [
      'admin_activity_logs',    // References admin_users
      'sales',                  // References nozzles, users
      'fuel_price_history',     // References stations, users (created_by)
      'nozzles',               // References pumps
      'pumps',                 // References stations
      'user_stations',         // References users, stations
      'creditors',             // Standalone or references stations
      'stations',              // References tenants
      'users',                 // References tenants
      'tenants',               // Standalone
      'admin_users'            // Standalone
    ];
    
    for (const table of deletionOrder) {
      try {
        const result = await client.query(`DELETE FROM ${table}`);
        console.log(`✅ Cleared ${table} (${result.rowCount} rows)`);
      } catch (error: any) {
        console.log(`⚠️ Could not clear ${table}: ${error.message}`);
        // Continue with other tables
      }
    }
    
    // Try to clear any remaining tables not in our list
    for (const table of allTables) {
      if (!deletionOrder.includes(table)) {
        try {
          const result = await client.query(`DELETE FROM ${table}`);
          console.log(`✅ Cleared additional table ${table} (${result.rowCount} rows)`);
        } catch (error: any) {
          console.log(`⚠️ Could not clear additional table ${table}: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Database reset completed successfully!');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase().catch(console.error);