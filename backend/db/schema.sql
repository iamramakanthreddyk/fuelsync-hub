-- FuelSync Hub Complete Database Schema
-- This file contains the complete database schema for the FuelSync Hub application

BEGIN;

-- Create ENUMs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('superadmin', 'owner', 'manager', 'employee');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'station_user_role') THEN
        CREATE TYPE station_user_role AS ENUM ('owner', 'manager', 'attendant');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'credit', 'mixed', 'credit_card', 'debit_card');
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

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tender_type') THEN
        CREATE TYPE tender_type AS ENUM ('cash', 'card', 'upi', 'credit');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_status') THEN
        CREATE TYPE shift_status AS ENUM ('open', 'closed', 'reconciled');
    END IF;
END $$;

-- Helper functions
CREATE OR REPLACE FUNCTION calc_sale_amount(volume NUMERIC, price NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(volume * price, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Automatically set effective_to for previous fuel price
CREATE OR REPLACE FUNCTION update_fuel_price_effective_to() RETURNS TRIGGER AS $$
BEGIN
    UPDATE fuel_price_history
    SET effective_to = NEW.effective_from
    WHERE station_id = NEW.station_id
      AND fuel_type = NEW.fuel_type
      AND effective_to IS NULL
      AND id <> NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Validation helper functions
CREATE OR REPLACE FUNCTION check_tenant_has_owner() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM users WHERE tenant_id = NEW.id AND role = 'owner' AND active = true
    ) THEN
        RAISE EXCEPTION 'Tenant must have at least one active owner';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_tenant_has_station() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM stations WHERE tenant_id = NEW.id AND active = true
    ) THEN
        RAISE EXCEPTION 'Tenant must have at least one active station';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_station_has_pump() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pumps WHERE station_id = NEW.id AND active = true
    ) THEN
        RAISE EXCEPTION 'Station must have at least one active pump';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_pump_has_nozzles() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    IF (
        SELECT COUNT(*) FROM nozzles WHERE pump_id = NEW.id AND active = true
    ) < 2 THEN
        RAISE EXCEPTION 'Pump must have at least two active nozzles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_station_has_users() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM user_stations WHERE station_id = NEW.id AND active = true
    ) THEN
        RAISE EXCEPTION 'Station must have at least one assigned user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_fuel_type() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fuel_type NOT IN ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg') THEN
        RAISE EXCEPTION 'Invalid fuel type. Must be one of: petrol, diesel, premium, super, cng, lpg';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_payment_method() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_method NOT IN ('cash', 'card', 'upi', 'credit', 'mixed', 'credit_card', 'debit_card') THEN
        RAISE EXCEPTION 'Invalid payment method.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tables in dependency order

-- Tenants table (no dependencies)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Admin users table (no dependencies)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (depends on tenants)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    CONSTRAINT users_email_tenant_unique UNIQUE (email, tenant_id)
);

-- Stations table (depends on tenants)
CREATE TABLE IF NOT EXISTS stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(20),
    contact_phone VARCHAR(20),
    location JSONB,
    operating_hours JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- User stations table (depends on users and stations)
CREATE TABLE IF NOT EXISTS user_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    role station_user_role NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, station_id)
);

-- Pumps table (depends on stations)
CREATE TABLE IF NOT EXISTS pumps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    installation_date DATE DEFAULT CURRENT_DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(station_id, name)
);

-- Nozzles table (depends on pumps)
CREATE TABLE IF NOT EXISTS nozzles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE CASCADE,
    fuel_type VARCHAR(50) NOT NULL,
    color VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fuel price history table (depends on stations)
CREATE TABLE IF NOT EXISTS fuel_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    fuel_type VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_price CHECK (price_per_unit > 0)
);

-- Creditors table (station specific)
CREATE TABLE IF NOT EXISTS creditors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    email VARCHAR(255),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    credit_limit DECIMAL(12,2) DEFAULT 0,
    running_balance DECIMAL(12,2) DEFAULT 0,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table (depends on nozzles and users)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nozzle_id UUID NOT NULL REFERENCES nozzles(id),
    user_id UUID NOT NULL REFERENCES users(id),
    credit_party_id UUID REFERENCES creditors(id),
    sale_volume DECIMAL(10,3) NOT NULL,
    fuel_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) GENERATED ALWAYS AS (sale_volume * fuel_price) STORED,
    payment_method payment_method NOT NULL,
    status sale_status NOT NULL DEFAULT 'posted',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creditor payments table
CREATE TABLE IF NOT EXISTS creditor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creditor_id UUID NOT NULL REFERENCES creditors(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method creditor_payment_method NOT NULL,
    reference_number VARCHAR(100),
    recorded_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Tender entries table
CREATE TABLE IF NOT EXISTS tender_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    tender_type tender_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fuel inventory table
CREATE TABLE IF NOT EXISTS fuel_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    fuel_type fuel_type NOT NULL,
    current_volume NUMERIC(12,3) NOT NULL,
    capacity NUMERIC(12,3) NOT NULL,
    last_updated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fuel deliveries table
CREATE TABLE IF NOT EXISTS fuel_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    fuel_type fuel_type NOT NULL,
    volume NUMERIC(12,3) NOT NULL,
    price_per_unit NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    delivery_date TIMESTAMP NOT NULL,
    supplier TEXT,
    invoice_number TEXT,
    received_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Day reconciliations table
CREATE TABLE IF NOT EXISTS day_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sales NUMERIC(12,2) NOT NULL,
    cash_total NUMERIC(12,2) NOT NULL,
    credit_total NUMERIC(12,2) NOT NULL,
    card_total NUMERIC(12,2) NOT NULL,
    upi_total NUMERIC(12,2) NOT NULL,
    finalized BOOLEAN NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(station_id, date)
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id),
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes AFTER all tables are created
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stations_tenant ON stations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_stations_user ON user_stations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stations_station ON user_stations(station_id);
CREATE INDEX IF NOT EXISTS idx_pumps_station ON pumps(station_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_pump ON nozzles(pump_id);
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_station ON fuel_price_history(station_id);
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_fuel_type ON fuel_price_history(fuel_type);
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_effective_from ON fuel_price_history(effective_from);
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_effective_range ON fuel_price_history(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_sales_nozzle ON sales(nozzle_id);
CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_creditor_payments_creditor_id ON creditor_payments(creditor_id);
CREATE INDEX IF NOT EXISTS idx_creditors_station_id ON creditors(station_id);
CREATE INDEX IF NOT EXISTS idx_shifts_station_id ON shifts(station_id);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_tender_entries_shift_id ON tender_entries(shift_id);
CREATE INDEX IF NOT EXISTS idx_tender_entries_station_id ON tender_entries(station_id);
CREATE INDEX IF NOT EXISTS idx_tender_entries_user_id ON tender_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tender_entries_tender_type ON tender_entries(tender_type);
CREATE INDEX IF NOT EXISTS idx_fuel_inventory_station_id ON fuel_inventory(station_id);
CREATE INDEX IF NOT EXISTS idx_fuel_deliveries_station_id ON fuel_deliveries(station_id);
CREATE INDEX IF NOT EXISTS idx_fuel_deliveries_received_by ON fuel_deliveries(received_by);
CREATE INDEX IF NOT EXISTS idx_day_reconciliations_station_id ON day_reconciliations(station_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- Triggers
DROP TRIGGER IF EXISTS set_fuel_price_effective_to ON fuel_price_history;
CREATE TRIGGER set_fuel_price_effective_to
AFTER INSERT ON fuel_price_history
FOR EACH ROW
EXECUTE FUNCTION update_fuel_price_effective_to();

DROP TRIGGER IF EXISTS check_tenant_owner_trigger ON tenants;
CREATE TRIGGER check_tenant_owner_trigger
AFTER INSERT OR UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION check_tenant_has_owner();

DROP TRIGGER IF EXISTS check_tenant_station_trigger ON tenants;
CREATE TRIGGER check_tenant_station_trigger
AFTER INSERT OR UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION check_tenant_has_station();

DROP TRIGGER IF EXISTS check_station_pump_trigger ON stations;
CREATE TRIGGER check_station_pump_trigger
AFTER INSERT OR UPDATE ON stations
FOR EACH ROW
EXECUTE FUNCTION check_station_has_pump();

DROP TRIGGER IF EXISTS check_station_users_trigger ON stations;
CREATE TRIGGER check_station_users_trigger
AFTER INSERT OR UPDATE ON stations
FOR EACH ROW
EXECUTE FUNCTION check_station_has_users();

DROP TRIGGER IF EXISTS check_pump_nozzles_trigger ON pumps;
CREATE TRIGGER check_pump_nozzles_trigger
AFTER INSERT OR UPDATE ON pumps
FOR EACH ROW
EXECUTE FUNCTION check_pump_has_nozzles();

DROP TRIGGER IF EXISTS validate_fuel_type_trigger ON nozzles;
CREATE TRIGGER validate_fuel_type_trigger
BEFORE INSERT OR UPDATE ON nozzles
FOR EACH ROW
EXECUTE FUNCTION validate_fuel_type();

DROP TRIGGER IF EXISTS validate_payment_method_trigger ON sales;
CREATE TRIGGER validate_payment_method_trigger
BEFORE INSERT OR UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION validate_payment_method();

COMMIT;