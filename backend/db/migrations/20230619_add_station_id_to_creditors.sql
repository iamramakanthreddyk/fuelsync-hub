-- Add station reference to creditors
-- UP
ALTER TABLE IF NOT EXISTS creditors
    ADD COLUMN IF NOT EXISTS station_id UUID REFERENCES stations(id) ON DELETE CASCADE;

-- Ensure existing rows have a station
UPDATE creditors SET station_id = (
    SELECT id FROM stations LIMIT 1
) WHERE station_id IS NULL;

-- Create index for quick lookups
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_creditors_station_id') THEN
        CREATE INDEX idx_creditors_station_id ON creditors(station_id);
    END IF;
END$$;

-- DOWN
ALTER TABLE IF EXISTS creditors DROP COLUMN IF EXISTS station_id;
