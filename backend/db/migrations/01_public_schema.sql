-- db/migrations/01_public_schema.sql
-- Public schema for tenant management

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Global tenant registry
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  schema_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT true,
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB
);

-- Plan definitions
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('basic', 'premium', 'enterprise')),
  max_stations INTEGER NOT NULL,
  max_employees INTEGER NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2) NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- Plan features for quick lookup
CREATE TABLE plan_features (
  plan_type TEXT PRIMARY KEY REFERENCES plans(name),
  max_stations INTEGER NOT NULL,
  max_employees INTEGER NOT NULL,
  enable_creditors BOOLEAN DEFAULT true,
  enable_reports BOOLEAN DEFAULT true,
  enable_analytics BOOLEAN DEFAULT false,
  enable_api_access BOOLEAN DEFAULT false,
  support_level TEXT DEFAULT 'standard'
);

-- Global admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'support', 'billing')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP,
  active BOOLEAN DEFAULT true
);

-- Admin activity logs
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  tenant_id UUID REFERENCES tenants(id),
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Insert default plans
INSERT INTO plans (name, max_stations, max_employees, price_monthly, price_yearly, features)
VALUES 
('basic', 1, 5, 29.99, 299.90, '{"reports": ["basic"], "support": "email"}'),
('premium', 5, 20, 99.99, 999.90, '{"reports": ["basic", "advanced"], "support": "priority"}'),
('enterprise', 999, 999, 299.99, 2999.90, '{"reports": ["basic", "advanced", "custom"], "support": "dedicated", "api_access": true}');

-- Insert plan features
INSERT INTO plan_features (plan_type, max_stations, max_employees, enable_creditors, enable_reports, enable_analytics, enable_api_access, support_level)
VALUES
('basic', 1, 5, true, true, false, false, 'standard'),
('premium', 5, 20, true, true, true, false, 'priority'),
('enterprise', 999, 999, true, true, true, true, 'dedicated');