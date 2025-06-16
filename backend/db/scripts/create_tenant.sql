-- db/scripts/create_tenant.sql
-- Script to create a new tenant schema

CREATE OR REPLACE FUNCTION create_tenant(tenant_name TEXT, plan TEXT)
RETURNS UUID AS $$DECLARE
  tenant_id UUID;
  schema_name TEXT;
BEGIN
  -- Generate schema name (sanitized tenant name + random suffix)
  schema_name := LOWER(REGEXP_REPLACE(tenant_name, '[^a-zA-Z0-9]', '_', 'g')) || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6);
  
  -- Create tenant record
  INSERT INTO public.tenants (name, plan_type, schema_name)
  VALUES (tenant_name, plan, schema_name)
  RETURNING id INTO tenant_id;
  
  -- Create schema
  EXECUTE 'CREATE SCHEMA ' || schema_name;
  
  -- Apply tenant schema template (execute template SQL)
  -- This would typically include running the template SQL file
  -- For this function, we'll assume another process handles this
  
  RETURN tenant_id;
END;$$ LANGUAGE plpgsql;