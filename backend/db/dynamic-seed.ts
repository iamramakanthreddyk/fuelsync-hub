// backend/db/dynamic-seed.ts
import { Pool } from 'pg';
import { generateUUID } from '../src/utils/uuid';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import inspectSchema from './inspect-schema';

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

async function dynamicSeed() {
  const client = await pool.connect();
  
  try {
    console.log('Starting dynamic seed process...');
    
    // First, inspect the schema
    let schemaInfo: any;
    const schemaPath = path.resolve(__dirname, 'schema-info.json');
    
    if (fs.existsSync(schemaPath)) {
      console.log('Using existing schema information...');
      schemaInfo = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    } else {
      console.log('Inspecting schema...');
      schemaInfo = await inspectSchema();
    }
    
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
    
    // Create a creditor based on actual schema
    const creditorId = generateUUID();
    if (schemaInfo.creditors) {
      const creditorColumns = schemaInfo.creditors.map((col: any) => col.column_name);
      console.log('Creditor columns:', creditorColumns);
      
      // Build dynamic insert query
      const insertColumns = [];
      const insertValues = [];
      const placeholders = [];
      let paramIndex = 1;
      
      // Always include id
      insertColumns.push('id');
      insertValues.push(creditorId);
      placeholders.push(`$${paramIndex++}`);
      
      // Add other columns based on schema
      if (creditorColumns.includes('party_name')) {
        insertColumns.push('party_name');
        insertValues.push('ABC Company');
        placeholders.push(`$${paramIndex++}`);
      } else if (creditorColumns.includes('name')) {
        insertColumns.push('name');
        insertValues.push('ABC Company');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('station_id')) {
        insertColumns.push('station_id');
        insertValues.push(stationId);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('party_contact')) {
        insertColumns.push('party_contact');
        insertValues.push('John Doe (555-4444)');
        placeholders.push(`$${paramIndex++}`);
      } else if (creditorColumns.includes('contact_person')) {
        insertColumns.push('contact_person');
        insertValues.push('John Doe');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('contact_phone')) {
        insertColumns.push('contact_phone');
        insertValues.push('555-4444');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('email')) {
        insertColumns.push('email');
        insertValues.push('john@abccompany.com');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('address')) {
        insertColumns.push('address');
        insertValues.push('456 Oak St, Anytown, CA 12345');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('credit_limit')) {
        insertColumns.push('credit_limit');
        insertValues.push(5000.00);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('running_balance')) {
        insertColumns.push('running_balance');
        insertValues.push(0.00);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('last_updated_at')) {
        insertColumns.push('last_updated_at');
        insertValues.push(new Date());
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('active')) {
        insertColumns.push('active');
        insertValues.push(true);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (creditorColumns.includes('notes')) {
        insertColumns.push('notes');
        insertValues.push('Demo creditor for testing');
        placeholders.push(`$${paramIndex++}`);
      }
      
      const creditorQuery = `
        INSERT INTO creditors (${insertColumns.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      
      await client.query(creditorQuery, insertValues);
      console.log('Created creditor:', creditorId);
    } else {
      console.log('Creditors table not found in schema');
      return;
    }
    
    // Create credit sales based on actual schema
    if (schemaInfo.sales) {
      const salesColumns = schemaInfo.sales.map((col: any) => col.column_name);
      console.log('Sales columns:', salesColumns);
      
      const sale1Id = generateUUID();
      
      // Build dynamic insert query for sales
      const insertColumns = [];
      const insertValues = [];
      const placeholders = [];
      let paramIndex = 1;
      
      // Always include id
      insertColumns.push('id');
      insertValues.push(sale1Id);
      placeholders.push(`$${paramIndex++}`);
      
      // Add other columns based on schema
      if (salesColumns.includes('station_id')) {
        insertColumns.push('station_id');
        insertValues.push(stationId);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('nozzle_id')) {
        insertColumns.push('nozzle_id');
        insertValues.push(nozzleId);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('user_id')) {
        insertColumns.push('user_id');
        insertValues.push(userId);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('recorded_at')) {
        insertColumns.push('recorded_at');
        insertValues.push(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('sale_volume')) {
        insertColumns.push('sale_volume');
        insertValues.push(50.0);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('fuel_price')) {
        insertColumns.push('fuel_price');
        insertValues.push(4.50);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('amount')) {
        insertColumns.push('amount');
        insertValues.push(225.00);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('payment_method')) {
        insertColumns.push('payment_method');
        insertValues.push('credit');
        placeholders.push(`$${paramIndex++}`);
      }
      
      // Try different creditor column names
      if (salesColumns.includes('credit_party_id')) {
        insertColumns.push('credit_party_id');
        insertValues.push(creditorId);
        placeholders.push(`$${paramIndex++}`);
      } else if (salesColumns.includes('creditor_id')) {
        insertColumns.push('creditor_id');
        insertValues.push(creditorId);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('credit_given')) {
        insertColumns.push('credit_given');
        insertValues.push(225.00);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('status')) {
        insertColumns.push('status');
        insertValues.push('posted');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('notes')) {
        insertColumns.push('notes');
        insertValues.push('Credit sale for testing');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (salesColumns.includes('created_at')) {
        insertColumns.push('created_at');
        insertValues.push(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
        placeholders.push(`$${paramIndex++}`);
      }
      
      const saleQuery = `
        INSERT INTO sales (${insertColumns.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      
      await client.query(saleQuery, insertValues);
      console.log('Created credit sale:', sale1Id);
    } else {
      console.log('Sales table not found in schema');
    }
    
    // Create payment based on actual schema
    // Check for credit_payments or creditor_payments table
    const paymentTable = schemaInfo.credit_payments ? 'credit_payments' : 
                         schemaInfo.creditor_payments ? 'creditor_payments' : null;
    
    if (paymentTable) {
      const paymentColumns = schemaInfo[paymentTable].map((col: any) => col.column_name);
      console.log(`${paymentTable} columns:`, paymentColumns);
      
      const paymentId = generateUUID();
      
      // Build dynamic insert query for payments
      const insertColumns = [];
      const insertValues = [];
      const placeholders = [];
      let paramIndex = 1;
      
      // Always include id
      insertColumns.push('id');
      insertValues.push(paymentId);
      placeholders.push(`$${paramIndex++}`);
      
      // Add other columns based on schema
      if (paymentColumns.includes('creditor_id')) {
        insertColumns.push('creditor_id');
        insertValues.push(creditorId);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (paymentColumns.includes('amount')) {
        insertColumns.push('amount');
        insertValues.push(225.00);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (paymentColumns.includes('payment_method')) {
        insertColumns.push('payment_method');
        insertValues.push('cash');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (paymentColumns.includes('reference_number')) {
        insertColumns.push('reference_number');
        insertValues.push('REF-12345');
        placeholders.push(`$${paramIndex++}`);
      }
      
      // Try different user column names
      if (paymentColumns.includes('received_by')) {
        insertColumns.push('received_by');
        insertValues.push(userId);
        placeholders.push(`$${paramIndex++}`);
      } else if (paymentColumns.includes('recorded_by')) {
        insertColumns.push('recorded_by');
        insertValues.push(userId);
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (paymentColumns.includes('paid_at')) {
        insertColumns.push('paid_at');
        insertValues.push(new Date());
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (paymentColumns.includes('notes')) {
        insertColumns.push('notes');
        insertValues.push('Payment for credit sale');
        placeholders.push(`$${paramIndex++}`);
      }
      
      if (paymentColumns.includes('created_at')) {
        insertColumns.push('created_at');
        insertValues.push(new Date());
        placeholders.push(`$${paramIndex++}`);
      }
      
      const paymentQuery = `
        INSERT INTO ${paymentTable} (${insertColumns.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      
      await client.query(paymentQuery, insertValues);
      console.log(`Created payment in ${paymentTable}:`, paymentId);
    } else {
      console.log('Payment table not found in schema');
    }
    
    await client.query('COMMIT');
    
    console.log('Dynamic seed completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in dynamic seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  dynamicSeed().catch(console.error);
}

export default dynamicSeed;