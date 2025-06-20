-- Add columns for voiding sales
ALTER TABLE IF EXISTS sales
    ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS void_reason TEXT;
