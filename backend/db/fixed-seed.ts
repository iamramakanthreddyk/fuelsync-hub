import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
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
  console.log('Starting database seeding with fixed hierarchy...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    client.release();
    
    // Step 1: Create admin user
    const adminId = uuidv4();
    const adminPassword = await hashPassword('admin123');
    
    console.log('Creating admin user');
    
    await executeQuery(
      `INSERT INTO admin_users (id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [adminId, 'admin@fuelsync.com', adminPassword, 'superadmin', 'Admin', 'User']
    );
    
    // Step 2: Create tenant with RETURNING id to ensure we get the actual ID
    const tenant1Name = 'Demo Fuel Company';
    const tenant1Email = 'demo@fuelsync.com';
    
    console.log(`Creating tenant: ${tenant1Name}`);
    
    const tenantResult = await executeQuery(
      `INSERT INTO tenants (id, name, email, subscription_plan, status, contact_person)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET name = $2
       RETURNING id`,
      [uuidv4(), tenant1Name, tenant1Email, 'premium', 'active', 'Demo Admin']
    );
    
    // Get the tenant ID from the result
    const tenant1Id = tenantResult.rows[0].id;
    console.log(`Tenant created with ID: ${tenant1Id}`);
    
    // Step 3: Create owner for tenant
    const ownerPassword = await hashPassword('owner123');
    const ownerId = uuidv4();
    
    console.log('Creating owner user');
    
    await executeQuery(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING
       RETURNING id`,
      [ownerId, 'owner@demo.com', ownerPassword, 'owner', 'John', 'Owner', tenant1Id]
    );
    
    // Step 4: Create stations for owner
    const station1Id = uuidv4();
    const station2Id = uuidv4();
    
    console.log('Creating stations');
    
    await executeQuery(
      `INSERT INTO stations (id, tenant_id, name, address, city, state, zip, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (tenant_id, name) DO NOTHING
       RETURNING id`,
      [station1Id, tenant1Id, 'Main Street Station', '123 Main St', 'Anytown', 'State', '12345', '555-1234']
    );
    
    await executeQuery(
      `INSERT INTO stations (id, tenant_id, name, address, city, state, zip, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (tenant_id, name) DO NOTHING
       RETURNING id`,
      [station2Id, tenant1Id, 'Highway Station', '456 Highway Rd', 'Othertown', 'State', '67890', '555-5678']
    );
    
    // Step 5: Assign owner to stations
    console.log('Assigning owner to stations');
    
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
    
    // Step 6: Create manager and employee users
    const managerPassword = await hashPassword('manager123');
    const employeePassword = await hashPassword('employee123');
    
    const managerId = uuidv4();
    const employeeId = uuidv4();
    
    console.log('Creating manager and employee users');
    
    await executeQuery(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      [managerId, 'manager@demo.com', managerPassword, 'manager', 'Jane', 'Manager', tenant1Id]
    );
    
    await executeQuery(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      [employeeId, 'employee@demo.com', employeePassword, 'employee', 'Bob', 'Employee', tenant1Id]
    );
    
    // Step 7: Assign manager and employee to stations
    console.log('Assigning manager and employee to stations');
    
    await executeQuery(
      `INSERT INTO user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), managerId, station1Id, 'manager']
    );
    
    await executeQuery(
      `INSERT INTO user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), employeeId, station1Id, 'attendant']
    );
    
    // Step 8: Create pumps for stations
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
    
    // Step 9: Create nozzles for pumps (at least 2 per pump)
    const nozzle1Id = uuidv4();
    const nozzle2Id = uuidv4();
    const nozzle3Id = uuidv4();
    const nozzle4Id = uuidv4();
    const nozzle5Id = uuidv4();
    const nozzle6Id = uuidv4();
    
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
      [nozzle4Id, pump2Id, 'diesel', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle5Id, pump3Id, 'petrol', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle6Id, pump3Id, 'diesel', 0, 0]
    );
    
    // Step 10: Create fuel prices for stations
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
      [uuidv4(), station2Id, 'petrol', 4.09, ownerId]
    );
    
    await executeQuery(
      `INSERT INTO fuel_price_history (id, station_id, fuel_type, price_per_unit, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), station2Id, 'diesel', 3.89, ownerId]
    );
    
    // Step 11: Create creditors
    const creditor1Id = uuidv4();
    const creditor2Id = uuidv4();
    
    console.log('Creating creditors');
    
    await executeQuery(
      `INSERT INTO creditors (id, party_name, contact_person, contact_phone, credit_limit)
       VALUES ($1, $2, $3, $4, $5)`,
      [creditor1Id, 'ABC Trucking', 'John Smith', '555-1111', 5000]
    );
    
    await executeQuery(
      `INSERT INTO creditors (id, party_name, contact_person, contact_phone, credit_limit)
       VALUES ($1, $2, $3, $4, $5)`,
      [creditor2Id, 'XYZ Logistics', 'Jane Doe', '555-2222', 10000]
    );
    
    // Step 12: Create tenant schema
    const schemaName = `tenant_${tenant1Id.replace(/-/g, '_')}`;
    console.log(`Creating tenant schema: ${schemaName}`);
    
    await executeQuery(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    
    // Step 13: Create enum types in tenant schema
    console.log('Creating enum types in tenant schema');
    
    await executeQuery(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".user_role AS ENUM ('superadmin', 'owner', 'manager', 'employee');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'station_user_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".station_user_role AS ENUM ('owner', 'manager', 'attendant');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".payment_method AS ENUM ('cash', 'card', 'upi', 'credit', 'mixed');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".sale_status AS ENUM ('pending', 'posted', 'voided');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".subscription_plan AS ENUM ('basic', 'premium', 'enterprise');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".tenant_status AS ENUM ('active', 'suspended', 'deleted');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".fuel_type AS ENUM ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creditor_payment_method' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".creditor_payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'upi', 'credit_card', 'debit_card');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".shift_status AS ENUM ('open', 'closed', 'reconciled');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tender_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
          CREATE TYPE "${schemaName}".tender_type AS ENUM ('cash', 'card', 'upi', 'credit');
        END IF;
      END $$;
    `);
    
    // Step 14: Create tables in tenant schema
    console.log('Creating tables in tenant schema');
    
    // Create users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role "${schemaName}".user_role NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        tenant_id UUID NOT NULL,
        phone VARCHAR(20),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create stations table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".stations (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        zip VARCHAR(20) NOT NULL,
        contact_phone VARCHAR(20) NOT NULL,
        location JSONB,
        operating_hours JSONB,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create user_stations table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".user_stations (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        station_id UUID NOT NULL,
        role "${schemaName}".station_user_role NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, station_id)
      )
    `);
    
    // Create pumps table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".pumps (
        id UUID PRIMARY KEY,
        station_id UUID NOT NULL,
        name VARCHAR(50) NOT NULL,
        serial_number VARCHAR(100) NOT NULL,
        installation_date DATE NOT NULL,
        last_maintenance_date DATE,
        next_maintenance_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create nozzles table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".nozzles (
        id UUID PRIMARY KEY,
        pump_id UUID NOT NULL,
        fuel_type "${schemaName}".fuel_type NOT NULL,
        initial_reading DECIMAL(10,2) NOT NULL,
        current_reading DECIMAL(10,2) NOT NULL,
        last_reading_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create nozzle_readings table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".nozzle_readings (
        id UUID PRIMARY KEY,
        nozzle_id UUID NOT NULL,
        reading DECIMAL(10,2) NOT NULL,
        recorded_by UUID NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )
    `);
    
    // Create creditors table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".creditors (
        id UUID PRIMARY KEY,
        party_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        contact_phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        credit_limit DECIMAL(10,2),
        running_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create fuel_price_history table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".fuel_price_history (
        id UUID PRIMARY KEY,
        station_id UUID NOT NULL,
        fuel_type "${schemaName}".fuel_type NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        effective_to TIMESTAMP,
        created_by UUID NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create sales table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".sales (
        id UUID PRIMARY KEY,
        station_id UUID NOT NULL,
        nozzle_id UUID NOT NULL,
        user_id UUID NOT NULL,
        recorded_at TIMESTAMP NOT NULL,
        sale_volume NUMERIC(12,3) NOT NULL,
        cumulative_reading NUMERIC(12,3) NOT NULL,
        previous_reading NUMERIC(12,3) NOT NULL,
        fuel_price NUMERIC(10,3) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        cash_received NUMERIC(10,2) DEFAULT 0,
        credit_given NUMERIC(10,2) DEFAULT 0,
        payment_method "${schemaName}".payment_method NOT NULL,
        credit_party_id UUID,
        status "${schemaName}".sale_status NOT NULL DEFAULT 'pending',
        voided_by UUID,
        voided_at TIMESTAMP,
        void_reason TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create creditor_payments table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".creditor_payments (
        id UUID PRIMARY KEY,
        creditor_id UUID NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method "${schemaName}".creditor_payment_method NOT NULL,
        reference_number VARCHAR(100),
        recorded_by UUID NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create shifts table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".shifts (
        id UUID PRIMARY KEY,
        station_id UUID NOT NULL,
        user_id UUID NOT NULL,
        start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        status "${schemaName}".shift_status NOT NULL DEFAULT 'open',
        opening_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
        closing_cash DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tender_entries table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".tender_entries (
        id UUID PRIMARY KEY,
        shift_id UUID NOT NULL,
        station_id UUID NOT NULL,
        user_id UUID NOT NULL,
        tender_type "${schemaName}".tender_type NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reference_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create day_reconciliations table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".day_reconciliations (
        id UUID PRIMARY KEY,
        station_id UUID NOT NULL,
        date DATE NOT NULL,
        total_sales DECIMAL(10,2) NOT NULL,
        cash_total DECIMAL(10,2) NOT NULL,
        credit_total DECIMAL(10,2) NOT NULL,
        card_total DECIMAL(10,2) NOT NULL,
        upi_total DECIMAL(10,2) NOT NULL,
        finalized BOOLEAN NOT NULL DEFAULT false,
        created_by UUID NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(station_id, date)
      )
    `);
    
    // Step 15: Copy data to tenant schema
    console.log('Copying data to tenant schema');
    
    // Copy users
    await executeQuery(`
      INSERT INTO "${schemaName}".users
      SELECT * FROM public.users
      WHERE tenant_id = $1
      ON CONFLICT (id) DO NOTHING
    `, [tenant1Id]);
    
    // Copy stations
    await executeQuery(`
      INSERT INTO "${schemaName}".stations
      SELECT * FROM public.stations
      WHERE tenant_id = $1
      ON CONFLICT (id) DO NOTHING
    `, [tenant1Id]);
    
    // Copy user_stations
    await executeQuery(`
      INSERT INTO "${schemaName}".user_stations
      SELECT us.* FROM public.user_stations us
      JOIN public.users u ON us.user_id = u.id
      WHERE u.tenant_id = $1
      ON CONFLICT (user_id, station_id) DO NOTHING
    `, [tenant1Id]);
    
    // Copy pumps
    await executeQuery(`
      INSERT INTO "${schemaName}".pumps
      SELECT p.* FROM public.pumps p
      JOIN public.stations s ON p.station_id = s.id
      WHERE s.tenant_id = $1
      ON CONFLICT (id) DO NOTHING
    `, [tenant1Id]);
    
    // Copy nozzles
    await executeQuery(`
      INSERT INTO "${schemaName}".nozzles
      SELECT n.* FROM public.nozzles n
      JOIN public.pumps p ON n.pump_id = p.id
      JOIN public.stations s ON p.station_id = s.id
      WHERE s.tenant_id = $1
      ON CONFLICT (id) DO NOTHING
    `, [tenant1Id]);
    
    // Copy creditors
    await executeQuery(`
      INSERT INTO "${schemaName}".creditors
      SELECT * FROM public.creditors
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Copy fuel_price_history
    await executeQuery(`
      INSERT INTO "${schemaName}".fuel_price_history
      SELECT fph.* FROM public.fuel_price_history fph
      JOIN public.stations s ON fph.station_id = s.id
      WHERE s.tenant_id = $1
      ON CONFLICT (id) DO NOTHING
    `, [tenant1Id]);
    
    // Step 16: Validate the seed data
    console.log('Validating seed data');
    
    // Check if owner has at least one station
    const ownerStationResult = await executeQuery(
      `SELECT COUNT(*) FROM public.user_stations
       WHERE user_id = $1 AND role = 'owner'`,
      [ownerId]
    );
    
    const ownerStationCount = parseInt(ownerStationResult.rows[0].count);
    console.log(`Owner has ${ownerStationCount} stations`);
    
    if (ownerStationCount === 0) {
      console.error('❌ Validation failed: Owner does not have any stations');
    } else {
      console.log('✅ Validation passed: Owner has at least one station');
    }
    
    // Check if each station has at least one pump
    const stationPumpResult = await executeQuery(
      `SELECT s.id, s.name, COUNT(p.id) as pump_count
       FROM public.stations s
       LEFT JOIN public.pumps p ON s.id = p.station_id
       WHERE s.tenant_id = $1
       GROUP BY s.id, s.name`,
      [tenant1Id]
    );
    
    console.log('Station pump counts:');
    let allStationsHavePumps = true;
    
    for (const row of stationPumpResult.rows) {
      const pumpCount = parseInt(row.pump_count);
      console.log(`Station ${row.name}: ${pumpCount} pumps`);
      
      if (pumpCount === 0) {
        console.error(`❌ Validation failed: Station ${row.name} does not have any pumps`);
        allStationsHavePumps = false;
      }
    }
    
    if (allStationsHavePumps) {
      console.log('✅ Validation passed: All stations have at least one pump');
    }
    
    // Check if each pump has at least two nozzles
    const pumpNozzleResult = await executeQuery(
      `SELECT p.id, p.name, s.name as station_name, COUNT(n.id) as nozzle_count
       FROM public.pumps p
       JOIN public.stations s ON p.station_id = s.id
       LEFT JOIN public.nozzles n ON p.id = n.pump_id
       WHERE s.tenant_id = $1
       GROUP BY p.id, p.name, s.name`,
      [tenant1Id]
    );
    
    console.log('Pump nozzle counts:');
    let allPumpsHaveEnoughNozzles = true;
    
    for (const row of pumpNozzleResult.rows) {
      const nozzleCount = parseInt(row.nozzle_count);
      console.log(`Pump ${row.name} at ${row.station_name}: ${nozzleCount} nozzles`);
      
      if (nozzleCount < 2) {
        console.error(`❌ Validation failed: Pump ${row.name} at ${row.station_name} has less than 2 nozzles`);
        allPumpsHaveEnoughNozzles = false;
      }
    }
    
    if (allPumpsHaveEnoughNozzles) {
      console.log('✅ Validation passed: All pumps have at least 2 nozzles');
    }
    
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