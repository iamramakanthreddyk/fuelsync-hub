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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_station_id ON fuel_price_history(station_id);
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_fuel_type ON fuel_price_history(fuel_type);
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_effective_from ON fuel_price_history(effective_from);
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_effective_range ON fuel_price_history(effective_from, effective_to);

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