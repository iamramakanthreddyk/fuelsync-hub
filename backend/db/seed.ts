import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Log connection parameters (without password)
console.log('Seed script - Database connection parameters:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Helper function to execute SQL with parameters
async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

// Main seed function
async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    client.release();
    
    // Create admin user
    const adminId = uuidv4();
    const adminPassword = await hashPassword('admin123');
    
    console.log('Creating admin user');
    
    await executeQuery(
      `INSERT INTO admin_users (id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [adminId, 'admin@fuelsync.com', adminPassword, 'superadmin', 'Admin', 'User']
    );
    
    // Create a tenant
    const tenantId = uuidv4();
    const tenantName = 'Demo Fuel Company';
    const tenantEmail = 'demo@fuelsync.com';
    
    console.log(`Creating tenant: ${tenantName}`);
    
    await executeQuery(
      `INSERT INTO tenants (id, name, email, subscription_plan, status, contact_person)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [tenantId, tenantName, tenantEmail, 'premium', 'active', 'Demo Admin']
    );
    
    // Create users
    const ownerPassword = await hashPassword('owner123');
    const managerPassword = await hashPassword('manager123');
    const employeePassword = await hashPassword('employee123');
    
    const ownerId = uuidv4();
    const managerId = uuidv4();
    const employeeId = uuidv4();
    
    console.log('Creating users');
    
    // Create owner
    await executeQuery(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      [ownerId, 'owner@demo.com', ownerPassword, 'owner', 'John', 'Owner', tenantId]
    );
    
    // Create manager
    await executeQuery(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      [managerId, 'manager@demo.com', managerPassword, 'manager', 'Jane', 'Manager', tenantId]
    );
    
    // Create employee
    await executeQuery(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      [employeeId, 'employee@demo.com', employeePassword, 'employee', 'Bob', 'Employee', tenantId]
    );
    
    // Create stations
    const station1Id = uuidv4();
    const station2Id = uuidv4();
    
    console.log('Creating stations');
    
    await executeQuery(
      `INSERT INTO stations (id, tenant_id, name, address, city, state, zip, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (tenant_id, name) DO NOTHING`,
      [station1Id, tenantId, 'Main Street Station', '123 Main St', 'Anytown', 'State', '12345', '555-1234']
    );
    
    await executeQuery(
      `INSERT INTO stations (id, tenant_id, name, address, city, state, zip, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (tenant_id, name) DO NOTHING`,
      [station2Id, tenantId, 'Highway Station', '456 Highway Rd', 'Othertown', 'State', '67890', '555-5678']
    );
    
    // Assign users to stations
    console.log('Assigning users to stations');
    
    // Owner to both stations
    await executeQuery(
      `INSERT INTO user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), ownerId, station1Id, 'owner']
    );
    
    await executeQuery(
      `INSERT INTO user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), ownerId, station2Id, 'owner']
    );
    
    // Manager to first station
    await executeQuery(
      `INSERT INTO user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), managerId, station1Id, 'manager']
    );
    
    // Employee to first station
    await executeQuery(
      `INSERT INTO user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), employeeId, station1Id, 'attendant']
    );
    
    // Create pumps
    const pump1Id = uuidv4();
    const pump2Id = uuidv4();
    const pump3Id = uuidv4();
    
    console.log('Creating pumps');
    
    await executeQuery(
      `INSERT INTO pumps (id, station_id, name, serial_number, installation_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (serial_number) DO NOTHING`,
      [pump1Id, station1Id, 'Pump 1', 'SN12345', '2023-01-01']
    );
    
    await executeQuery(
      `INSERT INTO pumps (id, station_id, name, serial_number, installation_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (serial_number) DO NOTHING`,
      [pump2Id, station1Id, 'Pump 2', 'SN67890', '2023-01-01']
    );
    
    await executeQuery(
      `INSERT INTO pumps (id, station_id, name, serial_number, installation_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (serial_number) DO NOTHING`,
      [pump3Id, station2Id, 'Pump 1', 'SN24680', '2023-01-01']
    );
    
    // Create nozzles
    const nozzle1Id = uuidv4();
    const nozzle2Id = uuidv4();
    const nozzle3Id = uuidv4();
    const nozzle4Id = uuidv4();
    
    console.log('Creating nozzles');
    
    await executeQuery(
      `INSERT INTO nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle1Id, pump1Id, 'petrol', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle2Id, pump1Id, 'diesel', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle3Id, pump2Id, 'petrol', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle4Id, pump3Id, 'diesel', 0, 0]
    );
    
    // Create creditors
    const creditor1Id = uuidv4();
    const creditor2Id = uuidv4();
    
    console.log('Creating creditors');
    
    await executeQuery(
      `INSERT INTO creditors (id, station_id, party_name, contact_person, contact_phone, credit_limit)`
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [creditor1Id, station1Id, 'ABC Trucking', 'John Smith', '555-1111', 5000]
    );
    
    await executeQuery(
      `INSERT INTO creditors (id, station_id, party_name, contact_person, contact_phone, credit_limit)`
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [creditor2Id, station2Id, 'XYZ Logistics', 'Jane Doe', '555-2222', 10000]
    );
    
    // Create fuel prices
    console.log('Creating fuel prices');
    
    await executeQuery(
      `INSERT INTO fuel_price_history (id, station_id, fuel_type, price_per_unit, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), station1Id, 'petrol', 3.99, ownerId]
    );
    
    await executeQuery(
      `INSERT INTO fuel_price_history (id, station_id, fuel_type, price_per_unit, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), station1Id, 'diesel', 3.79, ownerId]
    );
    
    await executeQuery(
      `INSERT INTO fuel_price_history (id, station_id, fuel_type, price_per_unit, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), station2Id, 'diesel', 3.89, ownerId]
    );
    
    // Create fuel inventory
    console.log('Creating fuel inventory');

    await executeQuery(
      `INSERT INTO fuel_inventory (id, station_id, fuel_type, current_volume, capacity, last_updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), station1Id, 'petrol', 5000, 10000, new Date()]
    );

    await executeQuery(
      `INSERT INTO fuel_inventory (id, station_id, fuel_type, current_volume, capacity, last_updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), station1Id, 'diesel', 3000, 8000, new Date()]
    );

    await executeQuery(
      `INSERT INTO fuel_inventory (id, station_id, fuel_type, current_volume, capacity, last_updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), station2Id, 'diesel', 4000, 9000, new Date()]
    );

    // Record fuel deliveries
    console.log('Creating fuel deliveries');

    await executeQuery(
      `INSERT INTO fuel_deliveries (id, station_id, fuel_type, volume, price_per_unit, total_amount, delivery_date, supplier, invoice_number, received_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [uuidv4(), station1Id, 'petrol', 5000, 3.5, 17500, new Date('2023-01-01'), 'Fuel Supplier A', 'INV-001', ownerId, 'Initial stock']
    );

    await executeQuery(
      `INSERT INTO fuel_deliveries (id, station_id, fuel_type, volume, price_per_unit, total_amount, delivery_date, supplier, invoice_number, received_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [uuidv4(), station1Id, 'diesel', 4000, 3.2, 12800, new Date('2023-01-02'), 'Fuel Supplier B', 'INV-002', ownerId, 'Initial stock']
    );

    await executeQuery(
      `INSERT INTO fuel_deliveries (id, station_id, fuel_type, volume, price_per_unit, total_amount, delivery_date, supplier, invoice_number, received_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [uuidv4(), station2Id, 'diesel', 6000, 3.3, 19800, new Date('2023-01-03'), 'Fuel Supplier A', 'INV-003', ownerId, 'Initial stock']
    );
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed().catch(console.error);
