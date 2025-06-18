// backend/db/universal-seed.ts
import { Pool } from 'pg';
import { generateUUID } from '../src/utils/uuid';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

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

// Get schema info from file or database
async function getSchemaInfo() {
  const schemaPath = path.resolve(__dirname, 'schema-info.json');
  
  if (fs.existsSync(schemaPath)) {
    console.log('Using existing schema information...');
    return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  }
  
  console.log('Inspecting database schema...');
  const client = await pool.connect();
  const schemaInfo: any = {};
  
  try {
    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log(`Found ${tables.length} tables: ${tables.join(', ')}`);
    
    // Get columns for each table
    for (const table of tables) {
      const columnsQuery = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          is_generated
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await client.query(columnsQuery, [table]);
      schemaInfo[table] = columnsResult.rows;
      
      console.log(`Table ${table} has ${columnsResult.rows.length} columns`);
    }
    
    // Write schema info to file
    fs.writeFileSync(schemaPath, JSON.stringify(schemaInfo, null, 2));
    
    return schemaInfo;
  } finally {
    client.release();
  }
}

async function universalSeed() {
  const client = await pool.connect();
  
  try {
    console.log('Starting universal seed process...');
    
    // Get schema info
    const schemaInfo = await getSchemaInfo();
    
    await client.query('BEGIN');
    
    // Get or create tenant
    let tenantId;
    const tenantResult = await client.query('SELECT id FROM tenants LIMIT 1');
    
    if (tenantResult.rows.length === 0) {
      console.log('No tenants found. Creating a demo tenant...');
      tenantId = generateUUID();
      await client.query(`
        INSERT INTO tenants (
          id, name, email, contact_person, contact_phone, subscription_plan, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        )
      `, [
        tenantId,
        'Demo Fuel Company',
        'demo-tenant@fuelsync.com',
        'Demo Admin',
        '555-1234',
        'premium',
        'active'
      ]);
      console.log('Created tenant:', tenantId);
    } else {
      tenantId = tenantResult.rows[0].id;
      console.log('Using existing tenant:', tenantId);
    }
    
    // Get or create station
    let stationId;
    const stationResult = await client.query('SELECT id FROM stations WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    
    if (stationResult.rows.length === 0) {
      console.log('No stations found. Creating a demo station...');
      stationId = generateUUID();
      await client.query(`
        INSERT INTO stations (
          id, name, address, city, state, zip, contact_phone, tenant_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `, [
        stationId,
        'Demo Station 1',
        '123 Main St',
        'Anytown',
        'CA',
        '12345',
        '555-1234',
        tenantId
      ]);
      console.log('Created station:', stationId);
    } else {
      stationId = stationResult.rows[0].id;
      console.log('Using existing station:', stationId);
    }
    
    // Get or create pump
    let pumpId;
    const pumpResult = await client.query('SELECT id FROM pumps WHERE station_id = $1 LIMIT 1', [stationId]);
    
    if (pumpResult.rows.length === 0) {
      console.log('No pumps found. Creating a demo pump...');
      pumpId = generateUUID();
      await client.query(`
        INSERT INTO pumps (
          id, name, serial_number, station_id, installation_date
        ) VALUES (
          $1, $2, $3, $4, $5
        )
      `, [
        pumpId,
        'Pump 1',
        'SN12345',
        stationId,
        new Date()
      ]);
      console.log('Created pump:', pumpId);
    } else {
      pumpId = pumpResult.rows[0].id;
      console.log('Using existing pump:', pumpId);
    }
    
    // Get or create nozzles
    let nozzleId;
    const nozzleResult = await client.query('SELECT id FROM nozzles WHERE pump_id = $1 LIMIT 1', [pumpId]);
    
    if (nozzleResult.rows.length === 0) {
      console.log('No nozzles found. Creating demo nozzles...');
      nozzleId = generateUUID();
      const nozzle2Id = generateUUID();
      
      await client.query(`
        INSERT INTO nozzles (
          id, pump_id, fuel_type, initial_reading, current_reading
        ) VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10)
      `, [
        nozzleId, pumpId, 'petrol', 0, 0,
        nozzle2Id, pumpId, 'diesel', 0, 0
      ]);
      console.log('Created nozzles:', nozzleId, nozzle2Id);
    } else {
      nozzleId = nozzleResult.rows[0].id;
      console.log('Using existing nozzle:', nozzleId);
    }
    
    // Get or create user
    let userId;
    const userResult = await client.query('SELECT id FROM users WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    
    if (userResult.rows.length === 0) {
      console.log('No users found. Creating demo users...');
      userId = generateUUID();
      await client.query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, role, tenant_id, phone, active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `, [
        userId,
        'demo@fuelsync.com',
        '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy', // password123
        'Demo',
        'User',
        'owner',
        tenantId,
        '555-1111',
        true
      ]);
      console.log('Created user:', userId);
    } else {
      userId = userResult.rows[0].id;
      console.log('Using existing user:', userId);
    }
    
    // Create creditor if table exists
    let creditorId;
    if (schemaInfo.creditors) {
      console.log('Creating creditor...');
      
      // Get columns that are not generated
      const creditorColumns = schemaInfo.creditors
        .filter((col: any) => col.is_generated !== 'ALWAYS')
        .map((col: any) => col.column_name);
      
      console.log('Creditor columns:', creditorColumns);
      
      // Build dynamic insert query
      const insertColumns = [];
      const insertValues = [];
      const placeholders = [];
      let paramIndex = 1;
      
      // Always include id
      if (creditorColumns.includes('id')) {
        creditorId = generateUUID();
        insertColumns.push('id');
        insertValues.push(creditorId);
        placeholders.push(`$${paramIndex++}`);
      }
      
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
      
      if (insertColumns.length > 0) {
        const creditorQuery = `
          INSERT INTO creditors (${insertColumns.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `;
        
        const result = await client.query(creditorQuery, insertValues);
        if (result.rows.length > 0) {
          creditorId = result.rows[0].id;
          console.log('Created creditor:', creditorId);
        } else {
          console.log('Creditor already exists');
        }
      }
    }
    
    // Create sales if table exists
    if (schemaInfo.sales) {
      console.log('Creating sales...');
      
      // Get columns that are not generated
      const salesColumns = schemaInfo.sales
        .filter((col: any) => col.is_generated !== 'ALWAYS')
        .map((col: any) => col.column_name);
      
      console.log('Sales columns (non-generated):', salesColumns);
      
      // Get generated columns
      const generatedColumns = schemaInfo.sales
        .filter((col: any) => col.is_generated === 'ALWAYS')
        .map((col: any) => col.column_name);
      
      console.log('Generated columns:', generatedColumns);
      
      const sale1Id = generateUUID();
      
      // Build dynamic insert query for sales
      const insertColumns = [];
      const insertValues = [];
      const placeholders = [];
      let paramIndex = 1;
      
      // Always include id
      if (salesColumns.includes('id')) {
        insertColumns.push('id');
        insertValues.push(sale1Id);
        placeholders.push(`$${paramIndex++}`);
      }
      
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
      
      if (salesColumns.includes('fuel_price') && !generatedColumns.includes('fuel_price')) {
        insertColumns.push('fuel_price');
        insertValues.push(4.50);
        placeholders.push(`$${paramIndex++}`);
      }
      
      // Skip amount if it's generated
      if (salesColumns.includes('amount') && !generatedColumns.includes('amount')) {
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
      if (salesColumns.includes('credit_party_id') && creditorId) {
        insertColumns.push('credit_party_id');
        insertValues.push(creditorId);
        placeholders.push(`$${paramIndex++}`);
      } else if (salesColumns.includes('creditor_id') && creditorId) {
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
      
      if (insertColumns.length > 0) {
        const saleQuery = `
          INSERT INTO sales (${insertColumns.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `;
        
        const result = await client.query(saleQuery, insertValues);
        if (result.rows.length > 0) {
          console.log('Created sale:', result.rows[0].id);
        } else {
          console.log('Sale already exists');
        }
      }
    }
    
    // Create payment based on actual schema
    // Check for credit_payments or creditor_payments table
    const paymentTable = schemaInfo.credit_payments ? 'credit_payments' : 
                         schemaInfo.creditor_payments ? 'creditor_payments' : null;
    
    if (paymentTable && creditorId) {
      console.log(`Creating payment in ${paymentTable}...`);
      
      // Get columns that are not generated
      const paymentColumns = schemaInfo[paymentTable]
        .filter((col: any) => col.is_generated !== 'ALWAYS')
        .map((col: any) => col.column_name);
      
      console.log(`${paymentTable} columns:`, paymentColumns);
      
      const paymentId = generateUUID();
      
      // Build dynamic insert query for payments
      const insertColumns = [];
      const insertValues = [];
      const placeholders = [];
      let paramIndex = 1;
      
      // Always include id
      if (paymentColumns.includes('id')) {
        insertColumns.push('id');
        insertValues.push(paymentId);
        placeholders.push(`$${paramIndex++}`);
      }
      
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
      
      if (insertColumns.length > 0) {
        const paymentQuery = `
          INSERT INTO ${paymentTable} (${insertColumns.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `;
        
        const result = await client.query(paymentQuery, insertValues);
        if (result.rows.length > 0) {
          console.log(`Created payment:`, result.rows[0].id);
        } else {
          console.log('Payment already exists');
        }
      }
    }
    
    await client.query('COMMIT');
    
    console.log('Universal seed completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in universal seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  universalSeed().catch(console.error);
}

export default universalSeed;