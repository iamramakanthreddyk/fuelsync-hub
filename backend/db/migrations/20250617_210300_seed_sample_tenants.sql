-- UP
-- Temporarily disable triggers
SET session_replication_role = 'replica';

-- Create sample tenants
INSERT INTO tenants (
  id,
  name,
  email,
  contact_person,
  contact_phone,
  subscription_plan,
  status,
  created_at,
  updated_at
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Demo Fuel Company',
  'demo-tenant@fuelsync.com',
  'Demo Admin',
  '555-1234',
  'premium',
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  '22222222-2222-2222-2222-222222222222',
  'ABC Petrol',
  'contact@abcpetrol.com',
  'John Smith',
  '555-5678',
  'basic',
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  '33333333-3333-3333-3333-333333333333',
  'XYZ Fuels',
  'info@xyzfuels.com',
  'Jane Doe',
  '555-9012',
  'enterprise',
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Create owner users for each tenant
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  tenant_id,
  phone,
  active,
  created_at,
  updated_at
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'owner@demofuel.com',
  -- Password: password123
  '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy',
  'Demo',
  'Owner',
  'owner',
  '11111111-1111-1111-1111-111111111111',
  '555-1111',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'owner@abcpetrol.com',
  -- Password: password123
  '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy',
  'ABC',
  'Owner',
  'owner',
  '22222222-2222-2222-2222-222222222222',
  '555-2222',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'owner@xyzfuels.com',
  -- Password: password123
  '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy',
  'XYZ',
  'Owner',
  'owner',
  '33333333-3333-3333-3333-333333333333',
  '555-3333',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Create stations for each tenant
INSERT INTO stations (
  id,
  name,
  address,
  city,
  state,
  zip,
  contact_phone,
  tenant_id,
  active,
  created_at,
  updated_at
) VALUES
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Demo Station 1',
  '123 Main St',
  'Anytown',
  'CA',
  '12345',
  '555-1234',
  '11111111-1111-1111-1111-111111111111',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'ABC Station 1',
  '456 Oak Ave',
  'Somewhere',
  'NY',
  '67890',
  '555-5678',
  '22222222-2222-2222-2222-222222222222',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'XYZ Station 1',
  '789 Pine Rd',
  'Nowhere',
  'TX',
  '54321',
  '555-9012',
  '33333333-3333-3333-3333-333333333333',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Create pumps for each station
INSERT INTO pumps (
  id,
  name,
  serial_number,
  station_id,
  active,
  created_at,
  updated_at
) VALUES
(
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  'Pump 1',
  'SN12345',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  'Pump 1',
  'SN67890',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  'Pump 1',
  'SN54321',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Create nozzles for each pump
INSERT INTO nozzles (
  id,
  number,
  fuel_type,
  pump_id,
  active,
  created_at,
  updated_at
) VALUES
(
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  1,
  'petrol',
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
  2,
  'diesel',
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'llllllll-llll-llll-llll-llllllllllll',
  1,
  'petrol',
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
  2,
  'diesel',
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn',
  1,
  'petrol',
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'oooooooo-oooo-oooo-oooo-oooooooooooo',
  2,
  'diesel',
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Assign users to stations
INSERT INTO user_stations (
  id,
  user_id,
  station_id,
  role,
  active,
  created_at,
  updated_at
) VALUES
(
  'pppppppp-pppp-pppp-pppp-pppppppppppp',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'owner',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'owner',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'owner',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- DOWN
-- Temporarily disable triggers
SET session_replication_role = 'replica';

-- Remove user-station assignments
DELETE FROM user_stations WHERE id IN (
  'pppppppp-pppp-pppp-pppp-pppppppppppp',
  'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq',
  'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr'
);

-- Remove nozzles
DELETE FROM nozzles WHERE id IN (
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
  'llllllll-llll-llll-llll-llllllllllll',
  'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
  'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn',
  'oooooooo-oooo-oooo-oooo-oooooooooooo'
);

-- Remove pumps
DELETE FROM pumps WHERE id IN (
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii'
);

-- Remove stations
DELETE FROM stations WHERE id IN (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'ffffffff-ffff-ffff-ffff-ffffffffffff'
);

-- Remove users
DELETE FROM users WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);

-- Remove tenants
DELETE FROM tenants WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Re-enable triggers
SET session_replication_role = 'origin';