// backend/db/simple-seed.ts
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

async function simpleSeed() {
  const client = await pool.connect();
  
  try {
    console.log('Starting simple seed process...');
    
    await client.query('BEGIN');
    
    // Get tenant
    const tenantResult = await client.query('SELECT id FROM tenants LIMIT 1');
    if (tenantResult.rows.length === 0) {
      throw new Error('No tenants found. Please run the main seed script first.');
    }
    const tenantId = tenantResult.rows[0].id;
    console.log('Using tenant:', tenantId);
    
    // Get station
    const stationResult = await client.query('SELECT id FROM stations WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    if (stationResult.rows.length === 0) {
      throw new Error('No stations found. Please run the main seed script first.');
    }
    const stationId = stationResult.rows[0].id;
    console.log('Using station:', stationId);
    
    // Get nozzle
    const nozzleResult = await client.query(`
      SELECT n.id 
      FROM nozzles n
      JOIN pumps p ON n.pump_id = p.id
      WHERE p.station_id = $1
      LIMIT 1
    `, [stationId]);
    if (nozzleResult.rows.length === 0) {
      throw new Error('No nozzles found. Please run the main seed script first.');
    }
    const nozzleId = nozzleResult.rows[0].id;
    console.log('Using nozzle:', nozzleId);
    
    // Get user
    const userResult = await client.query('SELECT id FROM users WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    if (userResult.rows.length === 0) {
      throw new Error('No users found. Please run the main seed script first.');
    }
    const userId = userResult.rows[0].id;
    console.log('Using user:', userId);
    
    // Create creditor
    const creditorId = generateUUID();
    await client.query(`
      INSERT INTO creditors (
        id,
        station_id,
        party_name,
        contact_person,
        contact_phone,
        email,
        address,
        credit_limit, 
        running_balance, 
        notes, 
        created_at, 
        updated_at, 
        last_updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
    `, [
      creditorId,
      stationId,
      'ABC Company',
      'John Doe',
      '555-4444',
      'john@abccompany.com',
      '456 Oak St, Anytown, CA 12345',
      5000.00,
      0.00,
      'Demo creditor for testing',
      new Date(),
      new Date(),
      new Date()
    ]);
    console.log('Created creditor:', creditorId);
    
    // Create credit sale
    const saleId = generateUUID();
    await client.query(`
      INSERT INTO sales (
        id, 
        station_id, 
        nozzle_id, 
        user_id, 
        recorded_at, 
        sale_volume, 
        cumulative_reading, 
        previous_reading, 
        fuel_price, 
        payment_method, 
        status, 
        notes, 
        created_at, 
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
    `, [
      saleId,
      stationId,
      nozzleId,
      userId,
      new Date(),
      50.0,
      1050.0,
      1000.0,
      4.50,
      'credit',
      'posted',
      'Credit sale for testing',
      new Date(),
      new Date()
    ]);
    console.log('Created sale:', saleId);
    
    // Create payment
    const paymentId = generateUUID();
    await client.query(`
      INSERT INTO creditor_payments (
        id, 
        creditor_id, 
        amount, 
        payment_method, 
        reference_number, 
        recorded_by, 
        notes, 
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
    `, [
      paymentId,
      creditorId,
      225.00,
      'cash',
      'REF-12345',
      userId,
      'Payment for credit sale',
      new Date()
    ]);
    console.log('Created payment:', paymentId);
    
    await client.query('COMMIT');
    console.log('Simple seed completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in simple seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  simpleSeed().catch(console.error);
}

export default simpleSeed;