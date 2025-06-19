import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

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

// Helper function to execute SQL
async function executeSQL(sql: string, description: string): Promise<void> {
  const client = await pool.connect();
  try {
    console.log(`Executing: ${description}...`);
    await client.query(sql);
    console.log(`✅ Success: ${description}`);
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Main function to apply schema in chunks
async function applySchemaInChunks() {
  console.log('Starting to apply schema in chunks...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    client.release();
    
    // Apply schema in chunks
    
    // 1. Create ENUMs
    await executeSQL(`
      DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
              CREATE TYPE user_role AS ENUM ('superadmin', 'owner', 'manager', 'employee');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'station_user_role') THEN
              CREATE TYPE station_user_role AS ENUM ('owner', 'manager', 'attendant');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
              CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'credit', 'mixed');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_status') THEN
              CREATE TYPE sale_status AS ENUM ('pending', 'posted', 'voided');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
              CREATE TYPE subscription_plan AS ENUM ('basic', 'premium', 'enterprise');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
              CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'deleted');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type') THEN
              CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creditor_payment_method') THEN
              CREATE TYPE creditor_payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'upi', 'credit_card', 'debit_card');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_status') THEN
              CREATE TYPE shift_status AS ENUM ('open', 'closed', 'reconciled');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tender_type') THEN
              CREATE TYPE tender_type AS ENUM ('cash', 'card', 'upi', 'credit');
          END IF;
      END $$;
    `, "Create ENUMs");
    
    // 2. Create helper functions
    await executeSQL(`
      CREATE OR REPLACE FUNCTION round_decimal(val numeric, places integer) RETURNS numeric AS $$
      BEGIN
          RETURN ROUND(val, places);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION calc_sale_amount(volume NUMERIC, price NUMERIC) 
      RETURNS NUMERIC AS $$
      BEGIN
          RETURN ROUND(volume * price, 2);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `, "Create helper functions");
    
    // 3. Create tenants table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS tenants (
          id UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          subscription_plan subscription_plan NOT NULL DEFAULT 'basic',
          status tenant_status NOT NULL DEFAULT 'active',
          contact_person VARCHAR(255) NOT NULL,
          contact_phone VARCHAR(20),
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          zip VARCHAR(20),
          max_stations INT DEFAULT 3,
          max_users INT DEFAULT 10,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `, "Create tenants table");
    
    // 4. Create admin tables
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS admin_users (
          id UUID PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin')),
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_activity_logs (
          id UUID PRIMARY KEY,
          admin_id UUID NOT NULL REFERENCES admin_users(id),
          action VARCHAR(50) NOT NULL,
          entity_type VARCHAR(50),
          entity_id UUID,
          details JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `, "Create admin tables");
    
    // 5. Create users table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role user_role NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          tenant_id UUID REFERENCES tenants(id),
          phone VARCHAR(20),
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT users_email_tenant_unique UNIQUE (email, tenant_id),
          CONSTRAINT users_tenant_id_required 
          CHECK (
              (role = 'superadmin' AND tenant_id IS NULL) OR
              (role != 'superadmin' AND tenant_id IS NOT NULL)
          )
      );
    `, "Create users table");
    
    // 6. Create stations table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS stations (
          id UUID PRIMARY KEY,
          tenant_id UUID NOT NULL REFERENCES tenants(id),
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(tenant_id, name)
      );
    `, "Create stations table");
    
    // 7. Create user_stations table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS user_stations (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
          role station_user_role NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, station_id)
      );
    `, "Create user_stations table");
    
    // 8. Create pumps and nozzles tables
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS pumps (
          id UUID PRIMARY KEY,
          station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
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
      );

      CREATE TABLE IF NOT EXISTS nozzles (
          id UUID PRIMARY KEY,
          pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE CASCADE,
          fuel_type fuel_type NOT NULL,
          initial_reading DECIMAL(10,2) NOT NULL,
          current_reading DECIMAL(10,2) NOT NULL,
          last_reading_date TIMESTAMP,
          status VARCHAR(50) DEFAULT 'active',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT valid_readings CHECK (current_reading >= initial_reading)
      );

      CREATE TABLE IF NOT EXISTS nozzle_readings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nozzle_id UUID NOT NULL REFERENCES nozzles(id) ON DELETE CASCADE,
          reading DECIMAL(10,2) NOT NULL,
          recorded_by UUID NOT NULL REFERENCES users(id),
          recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes TEXT
      );
    `, "Create pumps and nozzles tables");
    
    // 9. Create creditors table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS creditors (
          id UUID PRIMARY KEY,
          station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
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
      );
    `, "Create creditors table");
    
    // 10. Create fuel_price_history table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS fuel_price_history (
          id UUID PRIMARY KEY,
          station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
          fuel_type fuel_type NOT NULL,
          price_per_unit DECIMAL(10,2) NOT NULL,
          effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          effective_to TIMESTAMP,
          created_by UUID NOT NULL REFERENCES users(id),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT positive_price CHECK (price_per_unit > 0)
      );
    `, "Create fuel_price_history table");
    
    // 11. Create sales table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS sales (
          id UUID PRIMARY KEY,
          station_id UUID NOT NULL REFERENCES stations(id),
          nozzle_id UUID NOT NULL REFERENCES nozzles(id),
          user_id UUID NOT NULL REFERENCES users(id),
          recorded_at TIMESTAMP NOT NULL,
          sale_volume NUMERIC(12,3) NOT NULL,
          cumulative_reading NUMERIC(12,3) NOT NULL,
          previous_reading NUMERIC(12,3) NOT NULL,
          fuel_price NUMERIC(10,3) NOT NULL,
          amount NUMERIC(10,2) GENERATED ALWAYS AS (calc_sale_amount(sale_volume, fuel_price)) STORED,
          cash_received NUMERIC(10,2) DEFAULT 0,
          credit_given NUMERIC(10,2) DEFAULT 0,
          payment_method payment_method NOT NULL,
          credit_party_id UUID REFERENCES creditors(id),
          status sale_status NOT NULL DEFAULT 'pending',
          voided_by UUID REFERENCES users(id),
          voided_at TIMESTAMP,
          void_reason TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT valid_sale_readings CHECK (cumulative_reading > previous_reading),
          CONSTRAINT valid_sale_volume CHECK (ABS(sale_volume - (cumulative_reading - previous_reading)) < 0.001)
      );
    `, "Create sales table");
    
    // 12. Create creditor_payments table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS creditor_payments (
          id UUID PRIMARY KEY,
          creditor_id UUID NOT NULL REFERENCES creditors(id) ON DELETE CASCADE,
          amount DECIMAL(10,2) NOT NULL,
          payment_method creditor_payment_method NOT NULL,
          reference_number VARCHAR(100),
          recorded_by UUID NOT NULL REFERENCES users(id),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT positive_payment_amount CHECK (amount > 0)
      );
    `, "Create creditor_payments table");
    
    // 13. Create shifts and tender_entries tables
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS shifts (
          id UUID PRIMARY KEY,
          station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id),
          start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          end_time TIMESTAMP,
          status shift_status NOT NULL DEFAULT 'open',
          opening_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
          closing_cash DECIMAL(10,2),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tender_entries (
          id UUID PRIMARY KEY,
          shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
          station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id),
          tender_type tender_type NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          reference_number VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT positive_tender_amount CHECK (amount > 0)
      );
    `, "Create shifts and tender_entries tables");
    
    // 14. Create day_reconciliations table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS day_reconciliations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          total_sales DECIMAL(10,2) NOT NULL,
          cash_total DECIMAL(10,2) NOT NULL,
          credit_total DECIMAL(10,2) NOT NULL,
          card_total DECIMAL(10,2) NOT NULL,
          upi_total DECIMAL(10,2) NOT NULL,
          finalized BOOLEAN NOT NULL DEFAULT false,
          created_by UUID NOT NULL REFERENCES users(id),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(station_id, date)
      );
    `, "Create day_reconciliations table");
    
    // 15. Create functions and triggers
    await executeSQL(`
      CREATE OR REPLACE FUNCTION update_fuel_price_effective_to() RETURNS TRIGGER AS $$
      BEGIN
          -- Set effective_to on previous price record for the same station and fuel type
          UPDATE fuel_price_history
          SET effective_to = NEW.effective_from
          WHERE station_id = NEW.station_id
            AND fuel_type = NEW.fuel_type
            AND effective_to IS NULL
            AND id != NEW.id;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS set_fuel_price_effective_to ON fuel_price_history;
      CREATE TRIGGER set_fuel_price_effective_to
      AFTER INSERT ON fuel_price_history
      FOR EACH ROW
      EXECUTE FUNCTION update_fuel_price_effective_to();

      CREATE OR REPLACE FUNCTION validate_sale_amount() RETURNS trigger AS $$
      DECLARE
          calculated numeric;
          diff numeric;
      BEGIN
          -- Calculate expected amount with high precision
          calculated := round_decimal(NEW.sale_volume * NEW.fuel_price, 2);
          diff := ABS(calculated - NEW.amount);
          
          -- Allow for a small rounding difference (0.01)
          IF diff > 0.01 THEN
              RAISE EXCEPTION 'Invalid sale amount. Expected %, got %', calculated, NEW.amount;
          END IF;
          
          -- Round the amount to 2 decimal places to ensure consistency
          NEW.amount := round_decimal(NEW.amount, 2);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `, "Create functions and triggers");
    
    // 16. Create indexes
    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_users_email_tenant ON users(email, tenant_id);
      CREATE INDEX IF NOT EXISTS idx_stations_tenant ON stations(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_user_stations_user ON user_stations(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_stations_station ON user_stations(station_id);
      CREATE INDEX IF NOT EXISTS idx_user_stations_active ON user_stations(active);
      CREATE INDEX IF NOT EXISTS idx_pumps_station ON pumps(station_id);
      CREATE INDEX IF NOT EXISTS idx_nozzles_pump ON nozzles(pump_id);
      CREATE INDEX IF NOT EXISTS idx_fuel_price_history_station_id ON fuel_price_history(station_id);
      CREATE INDEX IF NOT EXISTS idx_fuel_price_history_fuel_type ON fuel_price_history(fuel_type);
      CREATE INDEX IF NOT EXISTS idx_fuel_price_history_effective_from ON fuel_price_history(effective_from);
      CREATE INDEX IF NOT EXISTS idx_fuel_price_history_effective_range ON fuel_price_history(effective_from, effective_to);
      CREATE INDEX IF NOT EXISTS idx_sales_station ON sales(station_id);
      CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);
      CREATE INDEX IF NOT EXISTS idx_sales_recorded_at ON sales(recorded_at);
      CREATE INDEX IF NOT EXISTS idx_creditors_station_id ON creditors(station_id);
      CREATE INDEX IF NOT EXISTS idx_creditor_payments_creditor_id ON creditor_payments(creditor_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_station_id ON shifts(station_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
      CREATE INDEX IF NOT EXISTS idx_tender_entries_shift_id ON tender_entries(shift_id);
      CREATE INDEX IF NOT EXISTS idx_tender_entries_station_id ON tender_entries(station_id);
      CREATE INDEX IF NOT EXISTS idx_tender_entries_user_id ON tender_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_tender_entries_tender_type ON tender_entries(tender_type);
    `, "Create indexes");
    
    // 17. Create migrations table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO migrations (name) VALUES ('complete_schema.sql');
    `, "Create migrations table");
    
    console.log('Schema applied successfully in chunks!');
  } catch (error) {
    console.error('Error applying schema in chunks:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
applySchemaInChunks().catch(console.error);