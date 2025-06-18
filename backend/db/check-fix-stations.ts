// backend/db/check-fix-stations.ts
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

async function checkAndFixStations() {
  const client = await pool.connect();
  
  try {
    console.log('Checking station relationships...');
    
    // Check tenant-station relationships
    const tenantStationsQuery = `
      SELECT t.id as tenant_id, t.name as tenant_name, 
             COUNT(s.id) as station_count
      FROM tenants t
      LEFT JOIN stations s ON s.tenant_id = t.id
      GROUP BY t.id, t.name
    `;
    
    const tenantStationsResult = await client.query(tenantStationsQuery);
    console.log('\nTenant-Station relationships:');
    console.table(tenantStationsResult.rows);
    
    // Check user-station relationships
    const userStationsQuery = `
      SELECT u.id as user_id, u.email, u.role, 
             COUNT(us.station_id) as assigned_stations
      FROM users u
      LEFT JOIN user_stations us ON us.user_id = u.id
      WHERE u.role != 'superadmin'
      GROUP BY u.id, u.email, u.role
    `;
    
    const userStationsResult = await client.query(userStationsQuery);
    console.log('\nUser-Station assignments:');
    console.table(userStationsResult.rows);
    
    // Find tenants without stations
    const tenantsWithoutStationsQuery = `
      SELECT t.id, t.name
      FROM tenants t
      LEFT JOIN stations s ON s.tenant_id = t.id
      WHERE s.id IS NULL
    `;
    
    const tenantsWithoutStationsResult = await client.query(tenantsWithoutStationsQuery);
    
    if (tenantsWithoutStationsResult.rows.length > 0) {
      console.log('\nFound tenants without stations:');
      console.table(tenantsWithoutStationsResult.rows);
      
      // Fix: Create stations for tenants without stations
      await client.query('BEGIN');
      
      for (const tenant of tenantsWithoutStationsResult.rows) {
        const stationId = generateUUID();
        await client.query(`
          INSERT INTO stations (
            id, name, address, city, state, zip, contact_phone, tenant_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          stationId,
          `${tenant.name} Station`,
          '123 Main St',
          'Anytown',
          'CA',
          '12345',
          '555-1234',
          tenant.id
        ]);
        
        console.log(`Created station for tenant ${tenant.name}`);
      }
      
      await client.query('COMMIT');
    } else {
      console.log('\nAll tenants have stations.');
    }
    
    // Find users without station assignments
    const usersWithoutStationsQuery = `
      SELECT u.id, u.email, u.role, u.tenant_id
      FROM users u
      LEFT JOIN user_stations us ON us.user_id = u.id
      WHERE us.id IS NULL AND u.role != 'superadmin'
    `;
    
    const usersWithoutStationsResult = await client.query(usersWithoutStationsQuery);
    
    if (usersWithoutStationsResult.rows.length > 0) {
      console.log('\nFound users without station assignments:');
      console.table(usersWithoutStationsResult.rows);
      
      // Fix: Assign users to stations
      await client.query('BEGIN');
      
      for (const user of usersWithoutStationsResult.rows) {
        // Find a station for this user's tenant
        const stationResult = await client.query(`
          SELECT id FROM stations WHERE tenant_id = $1 LIMIT 1
        `, [user.tenant_id]);
        
        if (stationResult.rows.length > 0) {
          const stationId = stationResult.rows[0].id;
          const userStationId = generateUUID();
          
          // Determine role based on user role
          let stationRole = 'attendant';
          if (user.role === 'owner') stationRole = 'owner';
          if (user.role === 'manager') stationRole = 'manager';
          
          await client.query(`
            INSERT INTO user_stations (
              id, user_id, station_id, role, active
            ) VALUES (
              $1, $2, $3, $4, $5
            )
          `, [
            userStationId,
            user.id,
            stationId,
            stationRole,
            true
          ]);
          
          console.log(`Assigned user ${user.email} to station ${stationId}`);
        } else {
          console.log(`No station found for user ${user.email}'s tenant`);
        }
      }
      
      await client.query('COMMIT');
    } else {
      console.log('\nAll users are assigned to stations.');
    }
    
    // Verify fixes
    console.log('\nVerifying fixes...');
    
    const verifyTenantsQuery = `
      SELECT t.id as tenant_id, t.name as tenant_name, 
             COUNT(s.id) as station_count
      FROM tenants t
      LEFT JOIN stations s ON s.tenant_id = t.id
      GROUP BY t.id, t.name
    `;
    
    const verifyTenantsResult = await client.query(verifyTenantsQuery);
    console.log('\nUpdated Tenant-Station relationships:');
    console.table(verifyTenantsResult.rows);
    
    const verifyUsersQuery = `
      SELECT u.id as user_id, u.email, u.role, 
             COUNT(us.station_id) as assigned_stations
      FROM users u
      LEFT JOIN user_stations us ON us.user_id = u.id
      WHERE u.role != 'superadmin'
      GROUP BY u.id, u.email, u.role
    `;
    
    const verifyUsersResult = await client.query(verifyUsersQuery);
    console.log('\nUpdated User-Station assignments:');
    console.table(verifyUsersResult.rows);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error checking/fixing stations:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
checkAndFixStations().catch(console.error);