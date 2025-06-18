-- UP
-- Insert default superadmin user
-- Password: admin123 (bcrypt hash)
INSERT INTO admin_users (
  id, 
  email, 
  password_hash, 
  role, 
  first_name, 
  last_name,
  active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@fuelsync.com',
  '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy',
  'superadmin',
  'Super',
  'Admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy',
  first_name = 'Super',
  last_name = 'Admin',
  active = true,
  updated_at = CURRENT_TIMESTAMP;

-- Insert default admin settings
INSERT INTO admin_settings (
  id,
  key,
  value,
  description,
  created_at,
  updated_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'tenant_limits',
  '{"basic": {"stations": 3, "users": 10}, "premium": {"stations": 10, "users": 50}, "enterprise": {"stations": -1, "users": -1}}',
  'Default limits for different tenant subscription plans',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  '00000000-0000-0000-0000-000000000002',
  'system_maintenance',
  '{"enabled": false, "message": "System is under maintenance", "allowedIPs": []}',
  'System maintenance mode settings',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (key) DO NOTHING;

-- DOWN
-- Remove admin settings
DELETE FROM admin_settings WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

-- Remove admin user
DELETE FROM admin_users WHERE email = 'admin@fuelsync.com';