// backend/db/fix-all-relationships.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

async function fixAllRelationships() {
  const client = await pool.connect();
  
  try {
    console.log('Starting comprehensive relationship fix...');
    
    // Step 1: Get all tenants
    const tenantsResult = await client.query(`
      SELECT id, name FROM tenants WHERE active = true
    `);
    
    const tenants = tenantsResult.rows;
    console.log(`Found ${tenants.length} active tenants`);
    
    for (const tenant of tenants) {
      console.log(`\nProcessing tenant: ${tenant.name} (${tenant.id})`);
      
      // Step 2: Get tenant schema name
      const schemaName = `tenant_${tenant.id.replace(/-/g, '_')}`;
      console.log(`Schema name: ${schemaName}`);
      
      // Step 3: Get all users for this tenant
      const usersResult = await client.query(`
        SELECT id, email, role FROM users WHERE tenant_id = $1 AND active = true
      `, [tenant.id]);
      
      const users = usersResult.rows;
      console.log(`Found ${users.length} active users for tenant`);
      
      // Step 4: Get all stations for this tenant
      const stationsResult = await client.query(`
        SELECT id, name FROM stations WHERE tenant_id = $1 AND active = true
      `, [tenant.id]);
      
      let stations = stationsResult.rows;
      console.log(`Found ${stations.length} active stations for tenant`);
      
      // Step 5: Create station if none exists
      if (stations.length === 0) {
        console.log('No stations found for tenant, creating one...');
        
        // Create a station for this tenant
        const stationId = uuidv4();
        await client.query(`
          INSERT INTO stations (
            id, name, tenant_id, address, city, state, zip, contact_phone
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          stationId,
          `${tenant.name} Main Station`,
          tenant.id,
          '123 Main St',
          'Anytown',
          'ST',
          '12345',
          '555-1234'
        ]);
        
        // Also create in tenant schema
        try {
          await client.query(`
            INSERT INTO ${schemaName}.stations (
              id, name, tenant_id, address, city, state, zip, contact_phone
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8
            )
          `, [
            stationId,
            `${tenant.name} Main Station`,
            tenant.id,
            '123 Main St',
            'Anytown',
            'ST',
            '12345',
            '555-1234'
          ]);
        } catch (error) {
          console.error(`Error creating station in tenant schema: ${(error as Error).message}`);
        }
        
        console.log(`Created station: ${stationId}`);
        stations = [{ id: stationId, name: `${tenant.name} Main Station` }];
      }
      
      // Step 6: Check if stations have pumps
      for (const station of stations) {
        console.log(`\nChecking pumps for station: ${station.name} (${station.id})`);
        
        // Check if station has pumps
        const pumpsResult = await client.query(`
          SELECT id, name FROM pumps WHERE station_id = $1 AND active = true
        `, [station.id]);
        
        let pumps = pumpsResult.rows;
        console.log(`Found ${pumps.length} active pumps for station`);
        
        // Create pump if none exists
        if (pumps.length === 0) {
          console.log('No pumps found for station, creating one...');
          
          // Get the current date for installation_date
          const currentDate = new Date().toISOString().split('T')[0];
          
          // Create a pump for this station
          const pumpId = uuidv4();
          await client.query(`
            INSERT INTO pumps (
              id, station_id, name, serial_number, installation_date
            ) VALUES (
              $1, $2, $3, $4, $5
            )
          `, [
            pumpId,
            station.id,
            'Pump 1',
            `SN-${Math.floor(Math.random() * 10000)}`,
            currentDate
          ]);
          
          // Also create in tenant schema
          try {
            await client.query(`
              INSERT INTO ${schemaName}.pumps (
                id, station_id, name, serial_number, installation_date
              ) VALUES (
                $1, $2, $3, $4, $5
              )
            `, [
              pumpId,
              station.id,
              'Pump 1',
              `SN-${Math.floor(Math.random() * 10000)}`,
              currentDate
            ]);
          } catch (error) {
            console.error(`Error creating pump in tenant schema: ${(error as Error).message}`);
          }
          
          console.log(`Created pump: ${pumpId}`);
          pumps = [{ id: pumpId, name: 'Pump 1' }];
          
          // Create nozzles for the pump
          const fuelTypes = ['Petrol', 'Diesel'];
          
          for (const fuelType of fuelTypes) {
            const nozzleId = uuidv4();
            await client.query(`
              INSERT INTO nozzles (
                id, pump_id, fuel_type, color
              ) VALUES (
                $1, $2, $3, $4
              )
            `, [
              nozzleId,
              pumpId,
              fuelType,
              fuelType === 'Petrol' ? 'Green' : 'Black'
            ]);
            
            // Also create in tenant schema
            try {
              await client.query(`
                INSERT INTO ${schemaName}.nozzles (
                  id, pump_id, fuel_type, color
                ) VALUES (
                  $1, $2, $3, $4
                )
              `, [
                nozzleId,
                pumpId,
                fuelType,
                fuelType === 'Petrol' ? 'Green' : 'Black'
              ]);
            } catch (error) {
              console.error(`Error creating nozzle in tenant schema: ${(error as Error).message}`);
            }
            
            console.log(`Created nozzle: ${nozzleId} (${fuelType})`);
            
            // Create fuel price for the nozzle
            const priceId = uuidv4();
            await client.query(`
              INSERT INTO fuel_price_history (
                id, station_id, fuel_type, price_per_unit, effective_from
              ) VALUES (
                $1, $2, $3, $4, NOW()
              )
            `, [
              priceId,
              station.id,
              fuelType,
              fuelType === 'Petrol' ? 4.50 : 4.20
            ]);
            
            // Also create in tenant schema
            try {
              await client.query(`
                INSERT INTO ${schemaName}.fuel_price_history (
                  id, station_id, fuel_type, price_per_unit, effective_from
                ) VALUES (
                  $1, $2, $3, $4, NOW()
                )
              `, [
                priceId,
                station.id,
                fuelType,
                fuelType === 'Petrol' ? 4.50 : 4.20
              ]);
            } catch (error) {
              console.error(`Error creating fuel price in tenant schema: ${(error as Error).message}`);
            }
            
            console.log(`Created fuel price: ${priceId} (${fuelType})`);
          }
        }
      }
      
      // Step 7: Check user-station assignments
      for (const user of users) {
        console.log(`\nChecking user: ${user.email} (${user.role})`);
        
        // Check if user has any station assignments
        const assignmentsResult = await client.query(`
          SELECT us.station_id, s.name as station_name, us.role as station_role
          FROM user_stations us
          JOIN stations s ON us.station_id = s.id
          WHERE us.user_id = $1 AND us.active = true
        `, [user.id]);
        
        const assignments = assignmentsResult.rows;
        console.log(`User has ${assignments.length} station assignments`);
        
        if (assignments.length === 0) {
          console.log('No station assignments found, creating assignments...');
          
          // Assign user to all stations if owner/manager, or first station if employee
          const stationsToAssign = user.role === 'employee' ? [stations[0]] : stations;
          
          for (const station of stationsToAssign) {
            const assignmentId = uuidv4();
            
            // Map user role to station role
            let stationRole = 'attendant';
            if (user.role === 'owner') stationRole = 'owner';
            if (user.role === 'manager') stationRole = 'manager';
            
            // Create assignment in public schema
            await client.query(`
              INSERT INTO user_stations (
                id, user_id, station_id, role, active
              ) VALUES (
                $1, $2, $3, $4, $5
              )
              ON CONFLICT (user_id, station_id) DO UPDATE
              SET role = $4, active = $5, updated_at = NOW()
            `, [
              assignmentId,
              user.id,
              station.id,
              stationRole,
              true
            ]);
            
            // Create assignment in tenant schema
            try {
              await client.query(`
                INSERT INTO ${schemaName}.user_stations (
                  id, user_id, station_id, role, active
                ) VALUES (
                  $1, $2, $3, $4, $5
                )
                ON CONFLICT (user_id, station_id) DO UPDATE
                SET role = $4, active = $5, updated_at = NOW()
              `, [
                assignmentId,
                user.id,
                station.id,
                stationRole,
                true
              ]);
            } catch (error) {
              console.error(`Error creating assignment in tenant schema: ${(error as Error).message}`);
            }
            
            console.log(`Created assignment: User ${user.email} -> Station ${station.name} (${stationRole})`);
          }
        }
      }
    }
    
    console.log('\nAll relationships fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing relationships:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
fixAllRelationships().catch(console.error);