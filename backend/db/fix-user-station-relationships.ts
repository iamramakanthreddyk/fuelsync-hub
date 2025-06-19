// backend/db/fix-user-station-relationships.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { generateUUID } from '../src/utils/uuid';

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

async function fixUserStationRelationships() {
  const client = await pool.connect();
  
  try {
    console.log('Starting to fix user-station relationships...');
    
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
      
      const stations = stationsResult.rows;
      console.log(`Found ${stations.length} active stations for tenant`);
      
      if (stations.length === 0) {
        console.log('No stations found for tenant, creating one...');
        
        // Create a station for this tenant
        const stationId = generateUUID();
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
        } catch (err) {
          console.error(`Error creating station in tenant schema: ${err.message}`);
        }
        
        console.log(`Created station: ${stationId}`);
        stations.push({ id: stationId, name: `${tenant.name} Main Station` });
      }
      
      // Step 5: Check user-station assignments
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
            const assignmentId = generateUUID();
            
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
            } catch (err) {
              console.error(`Error creating assignment in tenant schema: ${err.message}`);
            }
            
            console.log(`Created assignment: User ${user.email} -> Station ${station.name} (${stationRole})`);
          }
        }
      }
    }
    
    console.log('\nUser-station relationship fixes completed successfully!');
    
  } catch (error) {
    console.error('Error fixing user-station relationships:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
fixUserStationRelationships().catch(console.error);