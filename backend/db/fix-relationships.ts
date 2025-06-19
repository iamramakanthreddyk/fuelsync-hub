// backend/db/fix-relationships.ts - Fix data relationships
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Database connection parameters-- fix-relations>:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`SSL: ${process.env.DB_SSL}`);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
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
      
      // Assign users to stations
      for (const user of usersResult.rows) {
        const assignmentsResult = await client.query(`
          SELECT station_id FROM ${schemaName}.user_stations 
          WHERE user_id = $1 AND active = true
        `, [user.id]);
        
        if (assignmentsResult.rows.length === 0 && stations.length > 0) {
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
            
            console.log(`✅ Assigned user ${user.email} to station ${station.name} as ${stationRole}`);
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