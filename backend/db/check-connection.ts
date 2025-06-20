// backend/db/check-connection.ts - Test database connection
import pool from './dbPool';

async function checkConnection() {
  console.log('🔍 Testing database connection...');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}`);
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    
    console.log('✅ Connection successful!');
    console.log(`Current time: ${result.rows[0].current_time}`);
    console.log(`PostgreSQL version: ${result.rows[0].version}`);
    
    client.release();
  } catch (error) {
    console.error('❌ Connection failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkConnection().catch(console.error);