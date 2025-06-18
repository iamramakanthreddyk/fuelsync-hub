-- UP
-- Alter admin_sessions table to increase token length
ALTER TABLE admin_sessions ALTER COLUMN token TYPE TEXT;

-- DOWN
-- Revert admin_sessions table token length
ALTER TABLE admin_sessions ALTER COLUMN token TYPE VARCHAR(255);