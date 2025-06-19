-- UP
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS credit_party_id UUID REFERENCES creditors(id);

-- DOWN
ALTER TABLE sales
DROP COLUMN IF EXISTS credit_party_id;
