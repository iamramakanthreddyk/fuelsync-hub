// Verify database seeding is complete and correct
import pool from './dbPool';

async function verifySeed() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying database seed...\n');
    
    // Check admin user
    const adminResult = await client.query(`
      SELECT email, role, active FROM admin_users WHERE email = 'admin@fuelsync.com'
    `);
    
    if (adminResult.rows.length > 0) {
      console.log('✅ Admin user exists:', adminResult.rows[0].email);
    } else {
      console.log('❌ Admin user missing');
    }
    
    // Check tenant
    const tenantResult = await client.query(`
      SELECT name, email, active FROM tenants WHERE email = 'demo@company.com'
    `);
    
    if (tenantResult.rows.length > 0) {
      console.log('✅ Demo tenant exists:', tenantResult.rows[0].name);
    } else {
      console.log('❌ Demo tenant missing');
    }
    
    // Check users
    const userResult = await client.query(`
      SELECT COUNT(*) as count FROM users WHERE active = true
    `);
    console.log(`✅ Active users: ${userResult.rows[0].count}`);
    
    // Check stations
    const stationResult = await client.query(`
      SELECT COUNT(*) as count FROM stations WHERE active = true
    `);
    console.log(`✅ Active stations: ${stationResult.rows[0].count}`);
    
    // Check pumps
    const pumpResult = await client.query(`
      SELECT COUNT(*) as count FROM pumps WHERE active = true
    `);
    console.log(`✅ Active pumps: ${pumpResult.rows[0].count}`);
    
    // Check user-station assignments
    const assignmentResult = await client.query(`
      SELECT COUNT(*) as count FROM user_stations WHERE active = true
    `);
    console.log(`✅ User-station assignments: ${assignmentResult.rows[0].count}`);
    
    // Verify constraints are satisfied
    console.log('\n🔍 Verifying constraints...');
    
    // Check tenants have stations
    const tenantStationCheck = await client.query(`
      SELECT t.name, COUNT(s.id) as station_count
      FROM tenants t
      LEFT JOIN stations s ON t.id = s.tenant_id AND s.active = true
      WHERE t.active = true
      GROUP BY t.id, t.name
    `);
    
    tenantStationCheck.rows.forEach(row => {
      if (parseInt(row.station_count) > 0) {
        console.log(`✅ Tenant "${row.name}" has ${row.station_count} stations`);
      } else {
        console.log(`❌ Tenant "${row.name}" has no stations`);
      }
    });
    
    // Check stations have pumps
    const stationPumpCheck = await client.query(`
      SELECT s.name, COUNT(p.id) as pump_count
      FROM stations s
      LEFT JOIN pumps p ON s.id = p.station_id AND p.active = true
      WHERE s.active = true
      GROUP BY s.id, s.name
    `);
    
    stationPumpCheck.rows.forEach(row => {
      if (parseInt(row.pump_count) > 0) {
        console.log(`✅ Station "${row.name}" has ${row.pump_count} pumps`);
      } else {
        console.log(`❌ Station "${row.name}" has no pumps`);
      }
    });
    
    console.log('\n🎉 Verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifySeed().catch(console.error);