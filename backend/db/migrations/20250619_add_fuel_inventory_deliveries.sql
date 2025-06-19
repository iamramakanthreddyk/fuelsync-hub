-- Add fuel_inventory and fuel_deliveries tables
CREATE TABLE IF NOT EXISTS fuel_inventory (
    id UUID PRIMARY KEY,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    fuel_type TEXT NOT NULL,
    current_volume NUMERIC(12,3) NOT NULL,
    capacity NUMERIC(12,3) NOT NULL,
    last_updated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fuel_deliveries (
    id UUID PRIMARY KEY,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    fuel_type TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_fuel_inventory_station ON fuel_inventory(station_id);
CREATE INDEX IF NOT EXISTS idx_fuel_deliveries_station ON fuel_deliveries(station_id);
