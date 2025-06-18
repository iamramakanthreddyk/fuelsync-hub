// backend/db/seed-tenant-users.ts
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { generateUUID } from '../src/utils/uuid';

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

async function seedTenantUsers() {
  const client = await pool.connect();
  
  try {
    console.log('Starting tenant users seed...');
    
    await client.query('BEGIN');
    
    // Create a tenant if none exists
    const tenantResult = await client.query('SELECT id FROM tenants LIMIT 1');
    
    let tenantId;
    if (tenantResult.rows.length === 0) {
      console.log('No tenant found. Creating a demo tenant...');
      tenantId = generateUUID();
      await client.query(`
        INSERT INTO tenants (
          id,
          name,
          email,
          contact_person,
          contact_phone,
          subscription_plan,
          status
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
    
    // Create a station if none exists
    const stationResult = await client.query('SELECT id FROM stations WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    
    let stationId;
    if (stationResult.rows.length === 0) {
      console.log('No station found. Creating a demo station...');
      stationId = generateUUID();
      await client.query(`
        INSERT INTO stations (
          id,
          name,
          address,
          city,
          state,
          zip,
          contact_phone,
          tenant_id
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
    
    // Create a pump if none exists
    const pumpResult = await client.query('SELECT id FROM pumps WHERE station_id = $1 LIMIT 1', [stationId]);
    
    let pumpId;
    if (pumpResult.rows.length === 0) {
      console.log('No pump found. Creating a demo pump...');
      pumpId = generateUUID();
      await client.query(`
        INSERT INTO pumps (
          id,
          name,
          serial_number,
          station_id,
          installation_date
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
    
    // Create nozzles if none exist
    const nozzleResult = await client.query('SELECT id FROM nozzles WHERE pump_id = $1', [pumpId]);
    
    if (nozzleResult.rows.length === 0) {
      console.log('No nozzles found. Creating demo nozzles...');
      const nozzle1Id = generateUUID();
      const nozzle2Id = generateUUID();
      
      await client.query(`
        INSERT INTO nozzles (
          id,
          pump_id,
          fuel_type,
          initial_reading,
          current_reading
        ) VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10)
      `, [
        nozzle1Id, pumpId, 'petrol', 0, 0,
        nozzle2Id, pumpId, 'diesel', 0, 0
      ]);
      console.log('Created nozzles:', nozzle1Id, nozzle2Id);
    } else {
      console.log('Using existing nozzles');
    }
    
    // Create or update tenant users with known passwords
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if owner exists
    const ownerResult = await client.query(`
      SELECT id FROM users 
      WHERE tenant_id = $1 AND role = 'owner' AND email = 'owner@demofuel.com'
    `, [tenantId]);
    
    let ownerId;
    if (ownerResult.rows.length === 0) {
      console.log('Creating owner user...');
      ownerId = generateUUID();
      await client.query(`
        INSERT INTO users (
          id,
          email,
          password_hash,
          first_name,
          last_name,
          role,
          tenant_id,
          phone,
          active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `, [
        ownerId,
        'owner@demofuel.com',
        passwordHash,
        'Demo',
        'Owner',
        'owner',
        tenantId,
        '555-1111',
        true
      ]);
      console.log('Created owner:', ownerId);
    } else {
      ownerId = ownerResult.rows[0].id;
      console.log('Updating owner password...');
      await client.query(`
        UPDATE users SET password_hash = $1 WHERE id = $2
      `, [passwordHash, ownerId]);
      console.log('Updated owner password:', ownerId);
    }
    
    // Check if manager exists
    const managerResult = await client.query(`
      SELECT id FROM users 
      WHERE tenant_id = $1 AND role = 'manager' AND email = 'manager@demofuel.com'
    `, [tenantId]);
    
    let managerId;
    if (managerResult.rows.length === 0) {
      console.log('Creating manager user...');
      managerId = generateUUID();
      await client.query(`
        INSERT INTO users (
          id,
          email,
          password_hash,
          first_name,
          last_name,
          role,
          tenant_id,
          phone,
          active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `, [
        managerId,
        'manager@demofuel.com',
        passwordHash,
        'Demo',
        'Manager',
        'manager',
        tenantId,
        '555-2222',
        true
      ]);
      console.log('Created manager:', managerId);
    } else {
      managerId = managerResult.rows[0].id;
      console.log('Updating manager password...');
      await client.query(`
        UPDATE users SET password_hash = $1 WHERE id = $2
      `, [passwordHash, managerId]);
      console.log('Updated manager password:', managerId);
    }
    
    // Check if employee exists
    const employeeResult = await client.query(`
      SELECT id FROM users 
      WHERE tenant_id = $1 AND role = 'employee' AND email = 'employee@demofuel.com'
    `, [tenantId]);
    
    let employeeId;
    if (employeeResult.rows.length === 0) {
      console.log('Creating employee user...');
      employeeId = generateUUID();
      await client.query(`
        INSERT INTO users (
          id,
          email,
          password_hash,
          first_name,
          last_name,
          role,
          tenant_id,
          phone,
          active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `, [
        employeeId,
        'employee@demofuel.com',
        passwordHash,
        'Demo',
        'Employee',
        'employee',
        tenantId,
        '555-3333',
        true
      ]);
      console.log('Created employee:', employeeId);
    } else {
      employeeId = employeeResult.rows[0].id;
      console.log('Updating employee password...');
      await client.query(`
        UPDATE users SET password_hash = $1 WHERE id = $2
      `, [passwordHash, employeeId]);
      console.log('Updated employee password:', employeeId);
    }
    
    // Assign users to station
    console.log('Assigning users to station...');
    
    // Check if manager is assigned to station
    const managerStationResult = await client.query(`
      SELECT id FROM user_stations 
      WHERE user_id = $1 AND station_id = $2
    `, [managerId, stationId]);
    
    if (managerStationResult.rows.length === 0) {
      const managerStationId = generateUUID();
      await client.query(`
        INSERT INTO user_stations (
          id,
          user_id,
          station_id,
          role,
          active
        ) VALUES (
          $1, $2, $3, $4, $5
        )
      `, [
        managerStationId,
        managerId,
        stationId,
        'manager',
        true
      ]);
      console.log('Assigned manager to station');
    }
    
    // Check if employee is assigned to station
    const employeeStationResult = await client.query(`
      SELECT id FROM user_stations 
      WHERE user_id = $1 AND station_id = $2
    `, [employeeId, stationId]);
    
    if (employeeStationResult.rows.length === 0) {
      const employeeStationId = generateUUID();
      await client.query(`
        INSERT INTO user_stations (
          id,
          user_id,
          station_id,
          role,
          active
        ) VALUES (
          $1, $2, $3, $4, $5
        )
      `, [
        employeeStationId,
        employeeId,
        stationId,
        'attendant',
        true
      ]);
      console.log('Assigned employee to station');
    }
    
    await client.query('COMMIT');
    
    console.log('Tenant users seed completed successfully!');
    console.log('Login credentials:');
    console.log('- Owner: owner@demofuel.com / password123');
    console.log('- Manager: manager@demofuel.com / password123');
    console.log('- Employee: employee@demofuel.com / password123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding tenant users:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seedTenantUsers().catch(console.error);