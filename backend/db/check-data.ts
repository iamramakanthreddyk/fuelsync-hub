// Check actual data in database
import pool from './dbPool';

async function checkData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking actual database data...\n');
    
    // Check admin_users
    const adminResult = await client.query('SELECT COUNT(*) as count FROM admin_users');
    console.log('👤 Admin Users:', adminResult.rows[0].count);
    
    // Check tenants
    const tenantResult = await client.query('SELECT COUNT(*) as count FROM tenants WHERE active = true');
    console.log('🏢 Tenants:', tenantResult.rows[0].count);
    
    // Check users
    const userResult = await client.query('SELECT COUNT(*) as count FROM users WHERE active = true');
    console.log('👥 Users:', userResult.rows[0].count);
    
    // Check stations
    const stationResult = await client.query('SELECT COUNT(*) as count FROM stations WHERE active = true');
    console.log('🏪 Stations:', stationResult.rows[0].count);
    
    // Check pumps
    const pumpResult = await client.query('SELECT COUNT(*) as count FROM pumps WHERE active = true');
    console.log('⛽ Pumps:', pumpResult.rows[0].count);
    
    // Check nozzles
    const nozzleResult = await client.query('SELECT COUNT(*) as count FROM nozzles WHERE active = true');
    console.log('🔧 Nozzles:', nozzleResult.rows[0].count);
    
    // Check sales
    const salesResult = await client.query('SELECT COUNT(*) as count FROM sales');
    console.log('💰 Sales:', salesResult.rows[0].count);
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData().catch(console.error);