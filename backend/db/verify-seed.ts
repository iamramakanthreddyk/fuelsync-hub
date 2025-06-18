// backend/db/verify-seed.ts
import { Pool } from 'pg';
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

async function verifySeed() {
  const client = await pool.connect();
  
  try {
    console.log('Verifying seed data...');
    
    // Check creditors
    const creditorsQuery = `
      SELECT id, party_name, credit_limit, running_balance
      FROM creditors
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const creditorsResult = await client.query(creditorsQuery);
    console.log('\nRecent creditors:');
    creditorsResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Name: ${row.party_name}, Credit Limit: ${row.credit_limit}, Balance: ${row.running_balance}`);
    });
    
    // Check sales
    const salesQuery = `
      SELECT id, station_id, nozzle_id, user_id, sale_volume, fuel_price, amount, payment_method, status
      FROM sales
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const salesResult = await client.query(salesQuery);
    console.log('\nRecent sales:');
    salesResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Method: ${row.payment_method}, Amount: ${row.amount}, Status: ${row.status}`);
    });
    
    // Check payments
    const paymentsQuery = `
      SELECT id, creditor_id, amount, payment_method, reference_number, recorded_by
      FROM creditor_payments
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const paymentsResult = await client.query(paymentsQuery);
    console.log('\nRecent payments:');
    paymentsResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Creditor: ${row.creditor_id}, Amount: ${row.amount}, Method: ${row.payment_method}`);
    });
    
    // Check credit sales - simpler query
    const creditSalesQuery = `
      SELECT 
        s.id, 
        s.amount, 
        s.payment_method, 
        s.status
      FROM sales s
      WHERE s.payment_method = 'credit'
      ORDER BY s.created_at DESC
      LIMIT 5
    `;
    
    const creditSalesResult = await client.query(creditSalesQuery);
    console.log('\nCredit sales:');
    creditSalesResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Amount: ${row.amount}, Method: ${row.payment_method}, Status: ${row.status}`);
    });
    
    // Count credit sales
    const creditCountQuery = `
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM sales
      WHERE payment_method = 'credit'
    `;
    
    const creditCountResult = await client.query(creditCountQuery);
    console.log('\nCredit sales summary:');
    console.log(`Count: ${creditCountResult.rows[0].count}, Total: ${creditCountResult.rows[0].total}`);
    
  } catch (error) {
    console.error('Error verifying seed data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
verifySeed().catch(console.error);