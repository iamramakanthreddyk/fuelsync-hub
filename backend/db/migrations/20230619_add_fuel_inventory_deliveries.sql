-- Create fuel_inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS fuel_inventory (
    id UUID PRIMARY KEY,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    fuel_type fuel_type NOT NULL,
    current_volume NUMERIC(12,3) NOT NULL,
    capacity NUMERIC(12,3) NOT NULL,
    last_updated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_inventory_volume CHECK (current_volume >= 0),
    CONSTRAINT positive_inventory_capacity CHECK (capacity > 0)
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_fuel_inventory_station_id ON fuel_inventory(station_id);

-- Create fuel_deliveries table if it doesn't exist
CREATE TABLE IF NOT EXISTS fuel_deliveries (
    id UUID PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_delivery_volume CHECK (volume > 0),
    CONSTRAINT positive_delivery_price CHECK (price_per_unit > 0),
    CONSTRAINT positive_delivery_total CHECK (total_amount >= 0)
);

-- Indexes for fuel_deliveries
CREATE INDEX IF NOT EXISTS idx_fuel_deliveries_station_id ON fuel_deliveries(station_id);
CREATE INDEX IF NOT EXISTS idx_fuel_deliveries_received_by ON fuel_deliveries(received_by);

-- Create day_reconciliations table if it doesn't exist
CREATE TABLE IF NOT EXISTS day_reconciliations (
    id UUID PRIMARY KEY,
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

-- Index for day_reconciliations
CREATE INDEX IF NOT EXISTS idx_day_reconciliations_station_id ON day_reconciliations(station_id);
