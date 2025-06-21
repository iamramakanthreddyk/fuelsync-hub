-- Add missing indexes for common tenant and station filters
-- UP
CREATE INDEX IF NOT EXISTS idx_pumps_tenant ON pumps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_tenant ON nozzles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fuel_prices_tenant ON fuel_prices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fuel_price_history_tenant ON fuel_price_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_tenant ON sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nozzle_readings_tenant ON nozzle_readings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_creditors_tenant ON creditors(tenant_id);
-- DOWN
DROP INDEX IF EXISTS idx_creditors_tenant;
DROP INDEX IF EXISTS idx_nozzle_readings_tenant;
DROP INDEX IF EXISTS idx_sales_tenant;
DROP INDEX IF EXISTS idx_fuel_price_history_tenant;
DROP INDEX IF EXISTS idx_fuel_prices_tenant;
DROP INDEX IF EXISTS idx_nozzles_tenant;
DROP INDEX IF EXISTS idx_pumps_tenant;
