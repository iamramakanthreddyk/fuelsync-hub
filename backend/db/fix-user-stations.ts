// backend/db/fix-user-stations.ts
import { Pool } from 'pg';
import { generateUUID } from '../src/utils/uuid';
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
  ssl: { rejectUnauthorized: false }
});

async function fixUserStations() {
  const client = await pool.connect();
  
  try {
    console.log('Checking user-station assignments...');
    
    await client.query('BEGIN');
    
    // Find users without station assignments
    const usersWithoutStations = await client.query(`
      SELECT u.id, u.email, u.role, u.tenant_id
      FROM users u
      LEFT JOIN user_stations us ON us.user_id = u.id
      WHERE us.id IS NULL AND u.role != 'superadmin'
    `);
    
    console.log(`Found ${usersWithoutStations.rows.length} users without station assignments`);
    
    // Fix each user
    for (const user of usersWithoutStations.rows) {
      console.log(`\nFixing user: ${user.email} (${user.role})`);
      
      // Find stations for this user's tenant
      const stationsResult = await client.query(`
        SELECT id, name 
        FROM stations 
        WHERE tenant_id = $1
      `, [user.tenant_id]);
      
      if (stationsResult.rows.length === 0) {
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
          'Main Station',
          user.tenant_id,
          '123 Main St',
          'Anytown',
          'ST',
          '12345',
          '555-1234'
        ]);
        
        console.log('Created station:', stationId);
        
        // Assign user to the new station
        const userStationId = generateUUID();
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
          user.role === 'owner' ? 'owner' : 
          user.role === 'manager' ? 'manager' : 'employee',
          true
        ]);
        
        console.log('Created user-station assignment:', userStationId);
      } else {
        // Assign user to all tenant stations if owner/manager, or first station if employee
        const stationsToAssign = user.role === 'employee' ? 
          [stationsResult.rows[0]] : stationsResult.rows;
        
        for (const station of stationsToAssign) {
          const userStationId = generateUUID();
          await client.query(`
            INSERT INTO user_stations (
              id, user_id, station_id, role, active
            ) VALUES (
              $1, $2, $3, $4, $5
            )
            ON CONFLICT (user_id, station_id) DO NOTHING
          `, [
            userStationId,
            user.id,
            station.id,
            user.role === 'owner' ? 'owner' : 
            user.role === 'manager' ? 'manager' : 'employee',
            true
          ]);
          
          console.log(`Assigned user to station: ${station.name}`);
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Verify fixes
    const verifyQuery = `
      SELECT 
        u.email,
        u.role,
        COUNT(us.id) as station_count,
        STRING_AGG(s.name, ', ') as stations
      FROM users u
      LEFT JOIN user_stations us ON us.user_id = u.id
      LEFT JOIN stations s ON s.id = us.station_id
      WHERE u.role != 'superadmin'
      GROUP BY u.id, u.email, u.role
      ORDER BY u.email
    `;
    
    const verifyResult = await client.query(verifyQuery);
    
    console.log('\nUser-Station Assignments:');
    console.table(verifyResult.rows);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fixing user-station assignments:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  fixUserStations().catch(console.error);
}

export default fixUserStations;