// backend/db/reset-db.ts - Reset database before seeding
import pool from './dbPool';

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Starting complete database reset...');
    
    // Get tenant schemas first
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
    
    // Get all tables to understand complete structure
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
    
    // Complete deletion order based on discovered tables and dependencies
    const deletionOrder = [
      // Level 1: Most dependent tables (reference everything)
      'admin_activity_logs',    // References admin_users
      'admin_sessions',         // References admin_users  
      'admin_notifications',    // References admin_users
      'sales',                  // References nozzles, users
      'tender_entries',         // References shifts, users
      'shifts',                 // References users, stations
      'day_reconciliations',    // References stations, users
      'nozzle_readings',        // References nozzles, users
      'creditor_payments',      // References creditors, users
      
      // Level 2: Operational data
      'fuel_price_history',     // References stations, users
      'fuel_prices',           // References stations, users (THIS WAS THE MISSING ONE!)
      
      // Level 3: Equipment hierarchy
      'nozzles',               // References pumps
      'pumps',                 // References stations
      
      // Level 4: Relationships
      'user_stations',         // References users, stations
      'creditors',             // May reference stations
      
      // Level 5: Core entities
      'stations',              // References tenants
      'users',                 // References tenants
      
      // Level 6: Top level
      'tenants',               // Independent
      'admin_users',           // Independent
      'admin_settings',        // Independent
      'migrations'             // Independent
    ];
    
    console.log('🗑️ Deleting data in complete dependency order...');
    
    // Delete in specified order
    for (const table of deletionOrder) {
      if (allTables.includes(table)) {
        try {
          const result = await client.query(`DELETE FROM ${table}`);
          console.log(`✅ Cleared ${table} (${result.rowCount} rows)`);
        } catch (error: any) {
          console.log(`⚠️ Could not clear ${table}: ${error.message}`);
        }
      } else {
        console.log(`⏭️ Table ${table} not found, skipping`);
      }
    }
    
    // Handle any remaining tables not in our deletion order
    const remainingTables = allTables.filter(table => !deletionOrder.includes(table));
    if (remainingTables.length > 0) {
      console.log('🔄 Clearing remaining tables:', remainingTables.join(', '));
      for (const table of remainingTables) {
        try {
          const result = await client.query(`DELETE FROM ${table}`);
          console.log(`✅ Cleared remaining table ${table} (${result.rowCount} rows)`);
        } catch (error: any) {
          console.log(`⚠️ Could not clear remaining table ${table}: ${error.message}`);
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