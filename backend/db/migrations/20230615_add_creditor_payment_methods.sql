-- UP
-- Add new payment methods to the payment_method type if it doesn't already include them
DO $$
BEGIN
    -- Check if the payment_method type exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        -- Check if the values already exist in the type
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'upi' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')) THEN
            -- Add 'upi' to the payment_method type
            ALTER TYPE payment_method ADD VALUE 'upi';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'credit_card' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')) THEN
            -- Add 'credit_card' to the payment_method type
            ALTER TYPE payment_method ADD VALUE 'credit_card';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'debit_card' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')) THEN
            -- Add 'debit_card' to the payment_method type
            ALTER TYPE payment_method ADD VALUE 'debit_card';
        END IF;
    END IF;
END$$;

-- Create creditor_payment_method type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creditor_payment_method') THEN
        CREATE TYPE creditor_payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'upi', 'credit_card', 'debit_card');
    END IF;
END$$;

-- Create creditor_payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS creditor_payments (
    id UUID PRIMARY KEY,
    creditor_id UUID NOT NULL REFERENCES creditors(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method creditor_payment_method NOT NULL,
    reference_number VARCHAR(100),
    recorded_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_payment_amount CHECK (amount > 0)
);

-- Create index on creditor_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_creditor_payments_creditor_id ON creditor_payments(creditor_id);
-- DOWN
DROP INDEX IF EXISTS idx_creditor_payments_creditor_id;
DROP TABLE IF EXISTS creditor_payments;
DROP TYPE IF EXISTS creditor_payment_method;

