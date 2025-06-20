// backend/db/fix-relationships.ts - Fix data relationships
import { v4 as uuidv4 } from 'uuid';
import pool from './dbPool';

console.log('Database connection parameters-- fix-relations>:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`SSL: ${process.env.DB_SSL}`);
async function fixRelationships() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing data relationships...');
    
    // Get all tenants
    const tenantsResult = await client.query('SELECT id, name FROM tenants WHERE active = true');
    const tenants = tenantsResult.rows;
    
    for (const tenant of tenants) {
      console.log(`Processing tenant: ${tenant.name}`);
      
      // Get users for this tenant
      const usersResult = await client.query(
        'SELECT id, email, role FROM users WHERE tenant_id = $1 AND active = true',
        [tenant.id]
      );
      
      // Get stations for this tenant from public schema
      const stationsResult = await client.query(
        'SELECT id, name FROM stations WHERE tenant_id = $1 AND active = true',
        [tenant.id]
      );
      
      const stations = stationsResult.rows;
      
      if (stations.length === 0) {
        console.log(`No stations found for tenant ${tenant.name}, skipping...`);
        continue;
      }
      
      // Assign users to stations in public schema
      for (const user of usersResult.rows) {
        const assignmentsResult = await client.query(`
          SELECT station_id FROM user_stations 
          WHERE user_id = $1 AND active = true
        `, [user.id]);
        
        if (assignmentsResult.rows.length === 0) {
          const stationsToAssign = user.role === 'employee' ? [stations[0]] : stations;
          
          for (const station of stationsToAssign) {
            const assignmentId = uuidv4();
            let stationRole = 'attendant';
            if (user.role === 'owner') stationRole = 'owner';
            if (user.role === 'manager') stationRole = 'manager';
            
            await client.query(`
              INSERT INTO user_stations (id, user_id, station_id, role, active)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (user_id, station_id) DO UPDATE
              SET role = $4, active = $5, updated_at = NOW()
            `, [assignmentId, user.id, station.id, stationRole, true]);
            
            console.log(`✅ Assigned user ${user.email} to station ${station.name} as ${stationRole}`);
          }
        }
      }
      
      // Also update tenant schema if it exists
      const schemaName = `tenant_${tenant.id.replace(/-/g, '_')}`;
      
      try {
        // Check if tenant schema exists
        const schemaCheck = await client.query(`
          SELECT schema_name FROM information_schema.schemata 
          WHERE schema_name = $1
        `, [schemaName]);
        
        if (schemaCheck.rows.length > 0) {
          // Check if stations table exists in tenant schema
          const tableCheck = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = 'stations'
          `, [schemaName]);
          
          if (tableCheck.rows.length > 0) {
            // Copy assignments to tenant schema
            for (const user of usersResult.rows) {
              const stationsToAssign = user.role === 'employee' ? [stations[0]] : stations;
              
              for (const station of stationsToAssign) {
                let stationRole = 'attendant';
                if (user.role === 'owner') stationRole = 'owner';
                if (user.role === 'manager') stationRole = 'manager';
                
                await client.query(`
                  INSERT INTO ${schemaName}.user_stations (id, user_id, station_id, role, active)
                  VALUES ($1, $2, $3, $4, $5)
                  ON CONFLICT (user_id, station_id) DO UPDATE
                  SET role = $4, active = $5, updated_at = NOW()
                `, [uuidv4(), user.id, station.id, stationRole, true]);
              }
            }
            console.log(`✅ Updated tenant schema ${schemaName}`);
          }
        }
      } catch (schemaError) {
        console.log(`⚠️ Tenant schema ${schemaName} not accessible, skipping...`);
      }
    }
    
    console.log('✅ All relationships fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing relationships:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixRelationships().catch(console.error);