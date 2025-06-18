// backend/db/seed-credit-sales.ts
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

async function seedCreditSales() {
  const client = await pool.connect();
  
  try {
    console.log('Starting credit sales seed...');
    
    await client.query('BEGIN');
    
    // Get a tenant
    const tenantResult = await client.query('SELECT id FROM tenants LIMIT 1');
    
    if (tenantResult.rows.length === 0) {
      console.log('No tenants found. Please run the main seed script first.');
      return;
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    // Get a station
    const stationResult = await client.query('SELECT id FROM stations WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    
    if (stationResult.rows.length === 0) {
      console.log('No stations found. Please run the main seed script first.');
      return;
    }
    
    const stationId = stationResult.rows[0].id;
    
    // Get a nozzle
    const nozzleResult = await client.query(`
      SELECT n.id 
      FROM nozzles n
      JOIN pumps p ON n.pump_id = p.id
      WHERE p.station_id = $1
      LIMIT 1
    `, [stationId]);
    
    if (nozzleResult.rows.length === 0) {
      console.log('No nozzles found. Please run the main seed script first.');
      return;
    }
    
    const nozzleId = nozzleResult.rows[0].id;
    
    // Get a user
    const userResult = await client.query('SELECT id FROM users WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    
    if (userResult.rows.length === 0) {
      console.log('No users found. Please run the main seed script first.');
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Create a creditor
    const creditorId = generateUUID();
    await client.query(`
      INSERT INTO creditors (
        id,
        station_id,
        party_name,
        party_contact,
        running_balance,
        credit_limit,
        last_updated_at,
        active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
    `, [
      creditorId,
      stationId,
      'ABC Company',
      'John Doe (555-4444)',
      0.00,
      5000.00,
      new Date(),
      true
    ]);
    
    console.log('Created creditor:', creditorId);
    
    // Create credit sales - first check if the column exists
    const columnCheckQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sales' AND column_name = 'credit_party_id'
    `;
    
    const columnCheckResult = await client.query(columnCheckQuery);
    const hasCreditPartyId = columnCheckResult.rows.length > 0;
    
    // Create credit sales
    const sale1Id = generateUUID();
    let saleQuery;
    let saleParams;
    
    if (hasCreditPartyId) {
      saleQuery = `
        INSERT INTO sales (
          id,
          station_id,
          nozzle_id,
          user_id,
          recorded_at,
          sale_volume,
          fuel_price,
          amount,
          payment_method,
          credit_party_id,
          credit_given,
          status,
          notes,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
      `;
      saleParams = [
        sale1Id,
        stationId,
        nozzleId,
        userId,
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        50.0,
        4.50,
        225.00,
        'credit',
        creditorId,
        225.00, // credit_given
        'posted',
        'Credit sale for testing',
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      ];
    } else {
      // Try with different column name
      saleQuery = `
        INSERT INTO sales (
          id,
          station_id,
          nozzle_id,
          user_id,
          recorded_at,
          sale_volume,
          fuel_price,
          amount,
          payment_method,
          credit_given,
          status,
          notes,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
      `;
      saleParams = [
        sale1Id,
        stationId,
        nozzleId,
        userId,
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        50.0,
        4.50,
        225.00,
        'credit',
        225.00, // credit_given
        'posted',
        'Credit sale for testing',
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      ];
    }
    
    await client.query(saleQuery, saleParams);
    console.log('Created credit sale 1:', sale1Id);
    
    // Create a payment
    // First check if credit_payments table exists
    const tableCheckQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'credit_payments'
    `;
    
    const tableCheckResult = await client.query(tableCheckQuery);
    const hasCreditPaymentsTable = tableCheckResult.rows.length > 0;
    
    if (hasCreditPaymentsTable) {
      const paymentId = generateUUID();
      await client.query(`
        INSERT INTO credit_payments (
          id,
          creditor_id,
          amount,
          payment_method,
          received_by,
          notes,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        )
      `, [
        paymentId,
        creditorId,
        225.00,
        'cash',
        userId,
        'Payment for credit sale',
        new Date()
      ]);
      
      console.log('Created payment:', paymentId);
    } else {
      // Try with creditor_payments table
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
    }
    
    await client.query('COMMIT');
    
    console.log('Credit sales seed completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding credit sales:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seedCreditSales().catch(console.error);