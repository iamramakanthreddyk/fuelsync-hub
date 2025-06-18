-- UP
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS check_tenant_owner_trigger ON tenants;
DROP TRIGGER IF EXISTS check_tenant_station_trigger ON tenants;
DROP TRIGGER IF EXISTS check_station_pump_trigger ON stations;
DROP TRIGGER IF EXISTS check_station_users_trigger ON stations;
DROP TRIGGER IF EXISTS check_pump_nozzles_trigger ON pumps;
DROP TRIGGER IF EXISTS validate_fuel_type_trigger ON nozzles;
DROP TRIGGER IF EXISTS validate_payment_method_trigger ON sales;

-- Function to check if tenant has at least one owner
CREATE OR REPLACE FUNCTION check_tenant_has_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation for new tenants during initial creation
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE tenant_id = NEW.id 
        AND role = 'owner'
        AND active = true
    ) THEN
        RAISE EXCEPTION 'Tenant must have at least one active owner';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if tenant has at least one station
CREATE OR REPLACE FUNCTION check_tenant_has_station()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation for new tenants during initial creation
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    
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

-- Function to check if station has at least one pump
CREATE OR REPLACE FUNCTION check_station_has_pump()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation for new stations during initial creation
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    
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

-- Function to check if pump has at least two nozzles
CREATE OR REPLACE FUNCTION check_pump_has_nozzles()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation for new pumps during initial creation
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    
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

-- Function to check if station has assigned users
CREATE OR REPLACE FUNCTION check_station_has_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation for new stations during initial creation
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM user_stations 
        WHERE station_id = NEW.id 
        AND active = true
    ) THEN
        RAISE EXCEPTION 'Station must have at least one assigned user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate fuel type
CREATE OR REPLACE FUNCTION validate_fuel_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fuel_type NOT IN ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg') THEN
        RAISE EXCEPTION 'Invalid fuel type. Must be one of: petrol, diesel, premium, super, cng, lpg';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate payment method
CREATE OR REPLACE FUNCTION validate_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_method NOT IN ('cash', 'card', 'upi', 'credit') THEN
        RAISE EXCEPTION 'Invalid payment method. Must be one of: cash, card, upi, credit';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tenants
CREATE TRIGGER check_tenant_owner_trigger
AFTER INSERT OR UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION check_tenant_has_owner();

CREATE TRIGGER check_tenant_station_trigger
AFTER INSERT OR UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION check_tenant_has_station();

-- Create triggers for stations
CREATE TRIGGER check_station_pump_trigger
AFTER INSERT OR UPDATE ON stations
FOR EACH ROW
EXECUTE FUNCTION check_station_has_pump();

CREATE TRIGGER check_station_users_trigger
AFTER INSERT OR UPDATE ON stations
FOR EACH ROW
EXECUTE FUNCTION check_station_has_users();

-- Create trigger for pumps
CREATE TRIGGER check_pump_nozzles_trigger
AFTER INSERT OR UPDATE ON pumps
FOR EACH ROW
EXECUTE FUNCTION check_pump_has_nozzles();

-- Create trigger for nozzles
CREATE TRIGGER validate_fuel_type_trigger
BEFORE INSERT OR UPDATE ON nozzles
FOR EACH ROW
EXECUTE FUNCTION validate_fuel_type();

-- Create trigger for sales
CREATE TRIGGER validate_payment_method_trigger
BEFORE INSERT OR UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION validate_payment_method();

-- DOWN
-- Drop triggers
DROP TRIGGER IF EXISTS validate_payment_method_trigger ON sales;
DROP TRIGGER IF EXISTS validate_fuel_type_trigger ON nozzles;
DROP TRIGGER IF EXISTS check_pump_nozzles_trigger ON pumps;
DROP TRIGGER IF EXISTS check_station_users_trigger ON stations;
DROP TRIGGER IF EXISTS check_station_pump_trigger ON stations;
DROP TRIGGER IF EXISTS check_tenant_station_trigger ON tenants;
DROP TRIGGER IF EXISTS check_tenant_owner_trigger ON tenants;

-- Drop functions
DROP FUNCTION IF EXISTS validate_payment_method();
DROP FUNCTION IF EXISTS validate_fuel_type();
DROP FUNCTION IF EXISTS check_station_has_users();
DROP FUNCTION IF EXISTS check_pump_has_nozzles();
DROP FUNCTION IF EXISTS check_station_has_pump();
DROP FUNCTION IF EXISTS check_tenant_has_station();
DROP FUNCTION IF EXISTS check_tenant_has_owner();