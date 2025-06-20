-- UP
ALTER TABLE pumps ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;
ALTER TABLE pumps ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE fuel_price_history ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
-- DOWN
ALTER TABLE fuel_price_history DROP COLUMN IF EXISTS created_by;
ALTER TABLE pumps DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE pumps DROP COLUMN IF EXISTS last_maintenance_date;
