-- UP
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'creditor_payments') THEN
        ALTER TABLE creditor_payments RENAME TO credit_payments;
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_creditor_payments_creditor_id') THEN
        ALTER INDEX idx_creditor_payments_creditor_id RENAME TO idx_credit_payments_creditor_id;
    END IF;
END$$;

-- DOWN
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_payments') THEN
        ALTER TABLE credit_payments RENAME TO creditor_payments;
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_credit_payments_creditor_id') THEN
        ALTER INDEX idx_credit_payments_creditor_id RENAME TO idx_creditor_payments_creditor_id;
    END IF;
END$$;
