import { Pool } from 'pg';
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
  ssl: {
    rejectUnauthorized: false
  }
});

// Create enum types in tenant schema
async function createEnumTypes(client: any, schemaName: string) {
  console.log(`Creating enum types in ${schemaName}...`);
  
  // Define all enum types
  const enumTypes = [
    {
      name: 'user_role',
      values: ['superadmin', 'owner', 'manager', 'employee']
    },
    {
      name: 'station_user_role',
      values: ['owner', 'manager', 'attendant']
    },
    {
      name: 'payment_method',
      values: ['cash', 'card', 'upi', 'credit', 'mixed']
    },
    {
      name: 'sale_status',
      values: ['pending', 'posted', 'voided']
    },
    {
      name: 'subscription_plan',
      values: ['basic', 'premium', 'enterprise']
    },
    {
      name: 'tenant_status',
      values: ['active', 'suspended', 'deleted']
    },
    {
      name: 'fuel_type',
      values: ['petrol', 'diesel', 'premium', 'super', 'cng', 'lpg']
    },
    {
      name: 'creditor_payment_method',
      values: ['cash', 'bank_transfer', 'check', 'upi', 'credit_card', 'debit_card']
    },
    {
      name: 'shift_status',
      values: ['open', 'closed', 'reconciled']
    },
    {
      name: 'tender_type',
      values: ['cash', 'card', 'upi', 'credit']
    }
  ];
  
  // Create each enum type
  for (const enumType of enumTypes) {
    try {
      // Check if enum type exists
      const checkResult = await client.query(`
        SELECT 1 FROM pg_type 
        WHERE typname = $1 
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = $2)
      `, [enumType.name, schemaName]);
      
      if (checkResult.rows.length === 0) {
        // Create enum type
        const valuesString = enumType.values.map(v => `'${v}'`).join(', ');
        await client.query(`CREATE TYPE "${schemaName}"."${enumType.name}" AS ENUM (${valuesString})`);
        console.log(`Created enum type ${enumType.name} in ${schemaName}`);
      } else {
        console.log(`Enum type ${enumType.name} already exists in ${schemaName}`);
      }
    } catch (error) {
      console.error(`Error creating enum type ${enumType.name} in ${schemaName}:`, error);
      throw error;
    }
  }
}

// Create tenant tables
async function createTenantTables(client: any, schemaName: string) {
  console.log(`Creating tables in ${schemaName}...`);
  
  // Define tables to create
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role "${schemaName}".user_role NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      tenant_id UUID,
      phone VARCHAR(20),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Stations table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".stations (
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
    )`,
    
    // User stations table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".user_stations (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      station_id UUID NOT NULL,
      role "${schemaName}".station_user_role NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, station_id)
    )`,
    
    // Pumps table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".pumps (
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(station_id, name),
      UNIQUE(serial_number)
    )`,
    
    // Nozzles table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".nozzles (
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
    )`,
    
    // Nozzle readings table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".nozzle_readings (
      id UUID PRIMARY KEY,
      nozzle_id UUID NOT NULL,
      reading DECIMAL(10,2) NOT NULL,
      recorded_by UUID NOT NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    )`,
    
    // Creditors table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".creditors (
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
    )`,
    
    // Fuel price history table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".fuel_price_history (
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
    )`,
    
    // Sales table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".sales (
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
    )`,
    
    // Creditor payments table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".creditor_payments (
      id UUID PRIMARY KEY,
      creditor_id UUID NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method "${schemaName}".creditor_payment_method NOT NULL,
      reference_number VARCHAR(100),
      recorded_by UUID NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Shifts table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".shifts (
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
    )`,
    
    // Tender entries table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".tender_entries (
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
    )`,
    
    // Day reconciliations table
    `CREATE TABLE IF NOT EXISTS "${schemaName}".day_reconciliations (
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
    )`
  ];
  
  // Create each table
  for (const tableQuery of tables) {
    try {
      await client.query(tableQuery);
    } catch (error) {
      console.error(`Error creating table in ${schemaName}:`, error);
      throw error;
    }
  }
  
  console.log(`Tables created in ${schemaName}`);
}

// Create indexes
async function createIndexes(client: any, schemaName: string) {
  console.log(`Creating indexes in ${schemaName}...`);
  
  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_users_tenant ON "${schemaName}".users(tenant_id)`,
    `CREATE INDEX IF NOT EXISTS idx_stations_tenant ON "${schemaName}".stations(tenant_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_stations_user ON "${schemaName}".user_stations(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_stations_station ON "${schemaName}".user_stations(station_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_stations_active ON "${schemaName}".user_stations(active)`,
    `CREATE INDEX IF NOT EXISTS idx_pumps_station ON "${schemaName}".pumps(station_id)`,
    `CREATE INDEX IF NOT EXISTS idx_nozzles_pump ON "${schemaName}".nozzles(pump_id)`,
    `CREATE INDEX IF NOT EXISTS idx_fuel_price_history_station_id ON "${schemaName}".fuel_price_history(station_id)`,
    `CREATE INDEX IF NOT EXISTS idx_fuel_price_history_fuel_type ON "${schemaName}".fuel_price_history(fuel_type)`,
    `CREATE INDEX IF NOT EXISTS idx_fuel_price_history_effective_from ON "${schemaName}".fuel_price_history(effective_from)`,
    `CREATE INDEX IF NOT EXISTS idx_sales_station ON "${schemaName}".sales(station_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sales_user ON "${schemaName}".sales(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sales_recorded_at ON "${schemaName}".sales(recorded_at)`,
    `CREATE INDEX IF NOT EXISTS idx_creditor_payments_creditor_id ON "${schemaName}".creditor_payments(creditor_id)`,
    `CREATE INDEX IF NOT EXISTS idx_shifts_station_id ON "${schemaName}".shifts(station_id)`,
    `CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON "${schemaName}".shifts(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_shifts_status ON "${schemaName}".shifts(status)`,
    `CREATE INDEX IF NOT EXISTS idx_tender_entries_shift_id ON "${schemaName}".tender_entries(shift_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tender_entries_station_id ON "${schemaName}".tender_entries(station_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tender_entries_user_id ON "${schemaName}".tender_entries(user_id)`
  ];
  
  for (const indexQuery of indexes) {
    try {
      await client.query(indexQuery);
    } catch (error) {
      console.error(`Error creating index in ${schemaName}:`, error);
      // Don't throw error for indexes, continue with the rest
      console.log('Continuing with other indexes...');
    }
  }
  
  console.log(`Indexes created in ${schemaName}`);
}

// Create functions
async function createFunctions(client: any, schemaName: string) {
  console.log(`Creating functions in ${schemaName}...`);
  
  const functions = [
    `CREATE OR REPLACE FUNCTION "${schemaName}".round_decimal(val numeric, places integer) 
     RETURNS numeric AS $$
     BEGIN
         RETURN ROUND(val, places);
     END;
     $$ LANGUAGE plpgsql IMMUTABLE`,
     
    `CREATE OR REPLACE FUNCTION "${schemaName}".calc_sale_amount(volume NUMERIC, price NUMERIC) 
     RETURNS NUMERIC AS $$
     BEGIN
         RETURN ROUND(volume * price, 2);
     END;
     $$ LANGUAGE plpgsql IMMUTABLE`,
     
    `CREATE OR REPLACE FUNCTION "${schemaName}".update_fuel_price_effective_to() 
     RETURNS TRIGGER AS $$
     BEGIN
         UPDATE "${schemaName}".fuel_price_history
         SET effective_to = NEW.effective_from
         WHERE station_id = NEW.station_id
           AND fuel_type = NEW.fuel_type
           AND effective_to IS NULL
           AND id != NEW.id;
         RETURN NEW;
     END;
     $$ LANGUAGE plpgsql`
  ];
  
  for (const functionQuery of functions) {
    try {
      await client.query(functionQuery);
    } catch (error) {
      console.error(`Error creating function in ${schemaName}:`, error);
      throw error;
    }
  }
  
  console.log(`Functions created in ${schemaName}`);
}

// Create triggers
async function createTriggers(client: any, schemaName: string) {
  console.log(`Creating triggers in ${schemaName}...`);
  
  const triggers = [
    `DROP TRIGGER IF EXISTS set_fuel_price_effective_to ON "${schemaName}".fuel_price_history`,
    `CREATE TRIGGER set_fuel_price_effective_to
     AFTER INSERT ON "${schemaName}".fuel_price_history
     FOR EACH ROW
     EXECUTE FUNCTION "${schemaName}".update_fuel_price_effective_to()`
  ];
  
  for (const triggerQuery of triggers) {
    try {
      await client.query(triggerQuery);
    } catch (error) {
      console.error(`Error creating trigger in ${schemaName}:`, error);
      throw error;
    }
  }
  
  console.log(`Triggers created in ${schemaName}`);
}

async function createTenantSchema() {
  console.log('Creating tenant schema...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Get tenant IDs
    const tenantsResult = await client.query('SELECT id FROM tenants');
    const tenants = tenantsResult.rows;
    
    console.log(`Found ${tenants.length} tenants`);
    
    // Create schema for each tenant
    for (const tenant of tenants) {
      const tenantId = tenant.id;
      const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
      
      console.log(`Creating schema for tenant ${tenantId}: ${schemaName}`);
      
      try {
        // Start transaction
        await client.query('BEGIN');
        
        // Create schema
        await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        
        // Create enum types
        await createEnumTypes(client, schemaName);
        
        // Create tables
        await createTenantTables(client, schemaName);
        
        // Create indexes
        await createIndexes(client, schemaName);
        
        // Create functions
        await createFunctions(client, schemaName);
        
        // Create triggers
        await createTriggers(client, schemaName);
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log(`Schema created successfully for tenant ${tenantId}`);
      } catch (error) {
        // Rollback transaction
        await client.query('ROLLBACK');
        console.error(`Error creating schema for tenant ${tenantId}:`, error);
      }
    }
    
    client.release();
    console.log('Tenant schemas created successfully!');
  } catch (error) {
    console.error('Error creating tenant schemas:', error);
  } finally {
    await pool.end();
  }
}

createTenantSchema().catch(console.error);