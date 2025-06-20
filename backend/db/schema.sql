-- FuelSync Hub Complete Database Schema
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
END $$;

-- Create tables in dependency order
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

CREATE TABLE IF NOT EXISTS stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(20),
    contact_phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

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

CREATE TABLE IF NOT EXISTS pumps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    installation_date DATE DEFAULT CURRENT_DATE,
    last_maintenance_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(station_id, name)
);

CREATE TABLE IF NOT EXISTS nozzles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    fuel_type VARCHAR(50) NOT NULL,
    initial_reading NUMERIC(12,3) NOT NULL,
    current_reading NUMERIC(12,3) NOT NULL,
    last_reading_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT valid_readings CHECK (current_reading >= initial_reading)
);

CREATE TABLE IF NOT EXISTS fuel_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    fuel_type VARCHAR(50) NOT NULL,
    price_per_unit NUMERIC(10,3) NOT NULL,
    effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_price CHECK (price_per_unit > 0)
);

CREATE TABLE IF NOT EXISTS fuel_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    fuel_type VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_price CHECK (price_per_unit > 0)
);

CREATE TABLE IF NOT EXISTS creditors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    party_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    email VARCHAR(255),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    running_balance DECIMAL(12,2) DEFAULT 0,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION calc_sale_amount(volume NUMERIC, price NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(volume * price, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id),
    nozzle_id UUID NOT NULL REFERENCES nozzles(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sale_volume NUMERIC(12,3) NOT NULL,
    cumulative_reading NUMERIC(12,3) NOT NULL,
    previous_reading NUMERIC(12,3) NOT NULL,
    fuel_price NUMERIC(10,3) NOT NULL,
    amount NUMERIC(10,2) GENERATED ALWAYS AS (calc_sale_amount(sale_volume, fuel_price)) STORED,
    cash_received NUMERIC(10,2) DEFAULT 0,
    credit_given NUMERIC(10,2) DEFAULT 0,
    credit_party_id UUID REFERENCES creditors(id),
    payment_method payment_method NOT NULL,
    status sale_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_sale_readings CHECK (cumulative_reading > previous_reading),
    CONSTRAINT valid_sale_volume CHECK (ABS(sale_volume - (cumulative_reading - previous_reading)) < 0.001)
);

CREATE TABLE IF NOT EXISTS nozzle_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    nozzle_id UUID NOT NULL REFERENCES nozzles(id),
    reading NUMERIC(12,3) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID NOT NULL REFERENCES users(id),
    notes TEXT
);

COMMIT;