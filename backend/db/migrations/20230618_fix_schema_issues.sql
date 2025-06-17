-- This migration fixes any schema issues and ensures all required tables exist

-- Create station_user_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'station_user_role') THEN
        CREATE TYPE station_user_role AS ENUM ('owner', 'manager', 'attendant');
    END IF;
END$$;

-- Create user_stations table if it doesn't exist
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

-- Create indexes for user_stations if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_stations_user_id') THEN
        CREATE INDEX idx_user_stations_user_id ON user_stations(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_stations_station_id') THEN
        CREATE INDEX idx_user_stations_station_id ON user_stations(station_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_stations_active') THEN
        CREATE INDEX idx_user_stations_active ON user_stations(active);
    END IF;
END$$;

-- Create creditor_payment_method enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creditor_payment_method') THEN
        CREATE TYPE creditor_payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'upi', 'credit_card', 'debit_card');
    END IF;
END$$;

-- Create creditors table if it doesn't exist
CREATE TABLE IF NOT EXISTS creditors (
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
);

-- Create creditor_payments table if it doesn't exist
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

-- Create indexes for creditors and creditor_payments if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_creditor_payments_creditor_id') THEN
        CREATE INDEX idx_creditor_payments_creditor_id ON creditor_payments(creditor_id);
    END IF;
END$$;

-- Create shift_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_status') THEN
        CREATE TYPE shift_status AS ENUM ('open', 'closed', 'reconciled');
    END IF;
END$$;

-- Create tender_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tender_type') THEN
        CREATE TYPE tender_type AS ENUM ('cash', 'card', 'upi', 'credit');
    END IF;
END$$;

-- Create shifts table if it doesn't exist
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

-- Create tender_entries table if it doesn't exist
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

-- Create fuel_price_history table if it doesn't exist
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

-- Create function to automatically set effective_to on previous price when a new one is added
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

-- Create trigger to automatically update effective_to on previous price
DROP TRIGGER IF EXISTS set_fuel_price_effective_to ON fuel_price_history;
CREATE TRIGGER set_fuel_price_effective_to
AFTER INSERT ON fuel_price_history
FOR EACH ROW
EXECUTE FUNCTION update_fuel_price_effective_to();