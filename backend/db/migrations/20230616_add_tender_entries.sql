-- UP
-- Create tender_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tender_type') THEN
        CREATE TYPE tender_type AS ENUM ('cash', 'card', 'upi', 'credit');
    END IF;
END$$;

-- Create shift_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_status') THEN
        CREATE TYPE shift_status AS ENUM ('open', 'closed', 'reconciled');
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_shifts_station_id ON shifts(station_id);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_tender_entries_shift_id ON tender_entries(shift_id);
CREATE INDEX IF NOT EXISTS idx_tender_entries_station_id ON tender_entries(station_id);
CREATE INDEX IF NOT EXISTS idx_tender_entries_user_id ON tender_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tender_entries_tender_type ON tender_entries(tender_type);
-- DOWN
DROP INDEX IF EXISTS idx_tender_entries_tender_type;
DROP INDEX IF EXISTS idx_tender_entries_user_id;
DROP INDEX IF EXISTS idx_tender_entries_station_id;
DROP INDEX IF EXISTS idx_tender_entries_shift_id;
DROP INDEX IF EXISTS idx_shifts_status;
DROP INDEX IF EXISTS idx_shifts_user_id;
DROP INDEX IF EXISTS idx_shifts_station_id;
DROP TABLE IF EXISTS tender_entries;
DROP TABLE IF EXISTS shifts;
DROP TYPE IF EXISTS shift_status;
DROP TYPE IF EXISTS tender_type;

