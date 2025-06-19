// backend/db/fix-relationships.ts - Fix data relationships
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function fixRelationships() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing data relationships...');
    
    // Get all tenants
    const tenantsResult = await client.query('SELECT id, name FROM tenants WHERE active = true');
    const tenants = tenantsResult.rows;
    
    for (const tenant of tenants) {
      const schemaName = `tenant_${tenant.id.replace(/-/g, '_')}`;
      console.log(`Processing tenant: ${tenant.name}`);
      
      // Get users for this tenant
      const usersResult = await client.query(
        'SELECT id, email, role FROM users WHERE tenant_id = $1 AND active = true',
        [tenant.id]
      );
      
      // Get stations for this tenant
      const stationsResult = await client.query(
        `SELECT id, name FROM ${schemaName}.stations WHERE active = true`
      );
      
      let stations = stationsResult.rows;
      
      // Create station if none exists
      if (stations.length === 0) {
        const stationId = uuidv4();
        await client.query(`
          INSERT INTO ${schemaName}.stations (id, tenant_id, name, address, city, state, zip, contact_phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [stationId, tenant.id, `${tenant.name} Main Station`, '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
        
        stations = [{ id: stationId, name: `${tenant.name} Main Station` }];
        console.log(`Created station: ${stationId}`);
      }
      
      // Ensure stations have pumps
      for (const station of stations) {
        const pumpsResult = await client.query(
          `SELECT id FROM ${schemaName}.pumps WHERE station_id = $1 AND active = true`,
          [station.id]
        );
        
        if (pumpsResult.rows.length === 0) {
          const pumpId = uuidv4();
          await client.query(`
            INSERT INTO ${schemaName}.pumps (id, station_id, name, serial_number, installation_date)
            VALUES ($1, $2, $3, $4, CURRENT_DATE)
          `, [pumpId, station.id, 'Pump 1', `SN-${Math.floor(Math.random() * 10000)}`]);
          
          // Create nozzles
          const fuelTypes = ['Petrol', 'Diesel'];
          for (const fuelType of fuelTypes) {
            const nozzleId = uuidv4();
            await client.query(`
              INSERT INTO ${schemaName}.nozzles (id, pump_id, fuel_type, color)
              VALUES ($1, $2, $3, $4)
            `, [nozzleId, pumpId, fuelType, fuelType === 'Petrol' ? 'Green' : 'Black']);
            
            // Add fuel prices
            await client.query(`
              INSERT INTO ${schemaName}.fuel_price_history (station_id, fuel_type, price_per_unit)
              VALUES ($1, $2, $3)
              ON CONFLICT DO NOTHING
            `, [station.id, fuelType, fuelType === 'Petrol' ? 4.50 : 4.20]);
          }
          
          console.log(`Created pump and nozzles for station: ${station.name}`);
        }
      }
      
      // Assign users to stations
      for (const user of usersResult.rows) {
        const assignmentsResult = await client.query(`
          SELECT station_id FROM ${schemaName}.user_stations 
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
              INSERT INTO ${schemaName}.user_stations (id, user_id, station_id, role, active)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (user_id, station_id) DO UPDATE
              SET role = $4, active = $5, updated_at = NOW()
            `, [assignmentId, user.id, station.id, stationRole, true]);
            
            console.log(`Assigned user ${user.email} to station ${station.name} as ${stationRole}`);
          }
        }
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