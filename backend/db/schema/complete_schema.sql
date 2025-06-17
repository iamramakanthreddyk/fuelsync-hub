BEGIN;

-- Drop schema and recreate fresh
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;

-- Create ENUMs
CREATE TYPE user_role AS ENUM ('superadmin', 'owner', 'manager', 'employee');
CREATE TYPE station_user_role AS ENUM ('owner', 'manager', 'attendant');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'credit', 'mixed');
CREATE TYPE sale_status AS ENUM ('pending', 'posted', 'voided');
CREATE TYPE subscription_plan AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg');

-- Helper functions for decimal handling
CREATE OR REPLACE FUNCTION round_decimal(val numeric, places integer) RETURNS numeric AS $$
BEGIN
    RETURN ROUND(val, places);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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

-- Create a function to calculate sale amount with proper rounding
CREATE OR REPLACE FUNCTION calc_sale_amount(volume NUMERIC, price NUMERIC) 
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(volume * price, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Tenants table must come first as it's referenced by users
CREATE TABLE tenants (
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

-- Admin tables
CREATE TABLE admin_users (
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

-- Core tables
CREATE TABLE users (
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

CREATE TABLE stations (
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

CREATE TABLE user_stations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    role station_user_role NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, station_id)
);

CREATE TABLE pumps (
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

CREATE TABLE nozzles (
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

CREATE TABLE fuel_prices (
    id UUID PRIMARY KEY,
    station_id UUID NOT NULL REFERENCES stations(id),
    fuel_type fuel_type NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_price CHECK (price_per_unit > 0)
);

CREATE TABLE sales (
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
    payment_method payment_method NOT NULL,
    status sale_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_sale_readings CHECK (cumulative_reading > previous_reading),
    CONSTRAINT valid_sale_volume CHECK (ABS(sale_volume - (cumulative_reading - previous_reading)) < 0.001)
);

-- Indexes
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email_tenant ON users(email, tenant_id);
CREATE INDEX idx_stations_tenant ON stations(tenant_id);
CREATE INDEX idx_user_stations_user ON user_stations(user_id);
CREATE INDEX idx_user_stations_station ON user_stations(station_id);
CREATE INDEX idx_pumps_station ON pumps(station_id);
CREATE INDEX idx_nozzles_pump ON nozzles(pump_id);
CREATE INDEX idx_fuel_prices_station_type ON fuel_prices(station_id, fuel_type);
CREATE INDEX idx_fuel_prices_active ON fuel_prices(station_id, fuel_type) WHERE active = true;
CREATE INDEX idx_sales_station ON sales(station_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_recorded_at ON sales(recorded_at);

COMMIT;
