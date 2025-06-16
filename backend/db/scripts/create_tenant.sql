-- Script to create a new tenant schema

CREATE OR REPLACE FUNCTION create_tenant(tenant_id UUID, tenant_name TEXT, plan TEXT, schema_name TEXT)
RETURNS VOID AS $$BEGIN
  -- Create tenant record (UUID is now passed in)
  INSERT INTO public.tenants (id, name, plan_type, schema_name)
  VALUES (tenant_id, tenant_name, plan, schema_name);
  
  -- Create schema
  EXECUTE 'CREATE SCHEMA ' || schema_name;
  
  -- Apply tenant schema template will be handled separately
  
  RETURN;
END;$$ LANGUAGE plpgsql;