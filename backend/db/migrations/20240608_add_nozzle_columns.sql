-- UP
ALTER TABLE nozzles ADD COLUMN IF NOT EXISTS initial_reading NUMERIC(12,3) NOT NULL DEFAULT 0;
ALTER TABLE nozzles ADD COLUMN IF NOT EXISTS current_reading NUMERIC(12,3) NOT NULL DEFAULT 0;
ALTER TABLE nozzles ADD COLUMN IF NOT EXISTS last_reading_date TIMESTAMP;
ALTER TABLE nozzles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name='nozzles' AND constraint_name='nozzles_valid_readings_check') THEN
        ALTER TABLE nozzles ADD CONSTRAINT valid_readings CHECK (current_reading >= initial_reading);
    END IF;
END $$;

-- DOWN
ALTER TABLE nozzles DROP CONSTRAINT IF EXISTS valid_readings;
ALTER TABLE nozzles DROP COLUMN IF EXISTS status;
ALTER TABLE nozzles DROP COLUMN IF EXISTS last_reading_date;
ALTER TABLE nozzles DROP COLUMN IF EXISTS current_reading;
ALTER TABLE nozzles DROP COLUMN IF EXISTS initial_reading;
