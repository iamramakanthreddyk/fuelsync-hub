-- Remove immediate validation triggers

-- UP
DROP TRIGGER IF EXISTS check_tenant_station_trigger ON tenants;
DROP TRIGGER IF EXISTS check_station_pump_trigger ON stations;
DROP TRIGGER IF EXISTS check_pump_nozzles_trigger ON pumps;

DROP FUNCTION IF EXISTS check_tenant_has_station();
DROP FUNCTION IF EXISTS check_station_has_pump();
DROP FUNCTION IF EXISTS check_pump_has_nozzles();

-- DOWN
-- Recreate functions and triggers
CREATE OR REPLACE FUNCTION check_tenant_has_station()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM stations
        WHERE tenant_id = NEW.id
        AND active = true
    ) THEN
        RAISE EXCEPTION 'Tenant must have at least one active station';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_tenant_station_trigger
AFTER INSERT OR UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION check_tenant_has_station();

CREATE OR REPLACE FUNCTION check_station_has_pump()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pumps
        WHERE station_id = NEW.id
        AND active = true
    ) THEN
        RAISE EXCEPTION 'Station must have at least one active pump';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_station_pump_trigger
AFTER INSERT OR UPDATE ON stations
FOR EACH ROW
EXECUTE FUNCTION check_station_has_pump();

CREATE OR REPLACE FUNCTION check_pump_has_nozzles()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*) FROM nozzles
        WHERE pump_id = NEW.id
        AND active = true
    ) < 2 THEN
        RAISE EXCEPTION 'Pump must have at least two active nozzles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_pump_nozzles_trigger
AFTER INSERT OR UPDATE ON pumps
FOR EACH ROW
EXECUTE FUNCTION check_pump_has_nozzles();
