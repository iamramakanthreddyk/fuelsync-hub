-- Public schema for tenant management

-- REMOVE: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Global tenant registry
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  tenant_id UUID REFERENCES tenants(id),
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- We'll handle the inserts in JavaScript using randomUUID()