-- db/migrations/02_tenant_schema_template.sql
-- Template for new tenant schemas

-- User management
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'employee')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP,
  active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP
);

-- User sessions for audit
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  login_time TIMESTAMP NOT NULL DEFAULT now(),
  logout_time TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB
);

-- Activity logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Tenant settings
CREATE TABLE tenant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'YYYY-MM-DD',
  theme TEXT DEFAULT 'light',
  branding JSONB,
  invoice_footer TEXT,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Plan subscription details
CREATE TABLE subscription (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id TEXT NOT NULL,
  subscribed_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP,
  is_trial BOOLEAN DEFAULT false,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  payment_details JSONB,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'canceled', 'pending')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Stations
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  contact_phone TEXT,
  location JSONB, -- For storing lat/long
  operating_hours JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP
);

-- User station assignments with roles
CREATE TABLE user_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  station_id UUID REFERENCES stations(id),
  role TEXT CHECK (role IN ('manager', 'cashier', 'attendant')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT true,
  UNIQUE(user_id, station_id)
);

-- Pumps
CREATE TABLE pumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id),
  name TEXT NOT NULL,
  serial_number TEXT,
  installation_date DATE,
  last_maintenance_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP
);

-- Nozzles
CREATE TABLE nozzles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pump_id UUID REFERENCES pumps(id),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg')),
  initial_reading NUMERIC(12,3) NOT NULL,
  current_reading NUMERIC(12,3) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP
);

-- Nozzle readings history
CREATE TABLE nozzle_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nozzle_id UUID REFERENCES nozzles(id),
  reading NUMERIC(12,3) NOT NULL,
  recorded_at TIMESTAMP DEFAULT now(),
  recorded_by UUID REFERENCES users(id),
  notes TEXT
);

-- Fuel prices
CREATE TABLE fuel_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg')),
  price_per_unit NUMERIC(10,2) NOT NULL,
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(station_id, fuel_type, effective_from)
);

-- Creditors
CREATE TABLE creditors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id),
  party_name TEXT NOT NULL,
  party_contact TEXT,
  running_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  credit_limit NUMERIC(10,2),
  last_updated_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP
);

-- Sales
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id),
  nozzle_id UUID REFERENCES nozzles(id),
  user_id UUID REFERENCES users(id),
  recorded_at TIMESTAMP DEFAULT now(),
  sale_volume NUMERIC(12,3) NOT NULL CHECK (sale_volume > 0),
  cumulative_reading NUMERIC(12,3) NOT NULL,
  previous_reading NUMERIC(12,3) NOT NULL,
  fuel_price NUMERIC(10,2) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  cash_received NUMERIC(10,2) NOT NULL DEFAULT 0,
  credit_given NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit', 'card', 'upi', 'mixed')),
  credit_party_id UUID REFERENCES creditors(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'posted', 'voided')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CHECK (cash_received + credit_given = amount)
);

-- Credit payments
CREATE TABLE credit_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creditor_id UUID REFERENCES creditors(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMP NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer')),
  received_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Daily reconciliations
CREATE TABLE day_reconciliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id),
  date DATE NOT NULL,
  total_sales NUMERIC(12,2) NOT NULL,
  cash_total NUMERIC(12,2) NOT NULL,
  credit_total NUMERIC(12,2) NOT NULL,
  card_total NUMERIC(12,2) NOT NULL,
  upi_total NUMERIC(12,2) NOT NULL,
  finalized BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CHECK (cash_total + credit_total + card_total + upi_total = total_sales)
);

-- Inventory tracking
CREATE TABLE fuel_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg')),
  current_volume NUMERIC(12,3) NOT NULL,
  capacity NUMERIC(12,3) NOT NULL,
  last_updated_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Fuel deliveries
CREATE TABLE fuel_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'premium', 'super', 'cng', 'lpg')),
  volume NUMERIC(12,3) NOT NULL,
  price_per_unit NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  delivery_date TIMESTAMP NOT NULL,
  supplier TEXT,
  invoice_number TEXT,
  received_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Insert default tenant settings
INSERT INTO tenant_settings (timezone, currency, date_format, theme)
VALUES ('UTC', 'USD', 'YYYY-MM-DD', 'light');