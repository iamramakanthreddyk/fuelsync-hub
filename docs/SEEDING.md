# Data Seeding Guide

## Prerequisites

1. Clean database state
```bash
npm run db:reset
```

2. Verify schema
```bash
npm run db:validate
```

## Seeding Order

### 1. Core Data
Always seed in this order:

```sql
-- 1. Admin Users
INSERT INTO admin_users (id, email, password_hash, role) VALUES
  (uuid_generate_v4(), 'admin@fuelsync.com', '[hashed_password]', 'superadmin');

-- 2. Regular Users
INSERT INTO users (id, email, password_hash, role) VALUES
  (uuid_generate_v4(), 'owner@test.com', '[hashed_password]', 'owner');

-- 3. Stations
INSERT INTO stations (id, name, address) VALUES
  (uuid_generate_v4(), 'Station A', '123 Main St');

-- 4. User-Station Assignments
INSERT INTO user_stations (user_id, station_id, role) VALUES
  ([owner_id], [station_id], 'owner');
```

### 2. Equipment Setup
```sql
-- 1. Pumps
INSERT INTO pumps (id, station_id, name) VALUES
  (uuid_generate_v4(), [station_id], 'Pump 1');

-- 2. Nozzles
INSERT INTO nozzles (id, pump_id, fuel_type) VALUES
  (uuid_generate_v4(), [pump_id], 'petrol');

-- 3. Fuel Prices
INSERT INTO fuel_prices (station_id, fuel_type, price_per_unit) VALUES
  ([station_id], 'petrol', 2.50);
```

### 3. Transaction Data
```sql
-- 1. Sales
INSERT INTO sales (
  id, station_id, nozzle_id, amount, sale_volume
) VALUES (
  uuid_generate_v4(), [station_id], [nozzle_id], 50.00, 20
);

-- 2. Credits
INSERT INTO creditors (
  id, station_id, party_name, credit_limit
) VALUES (
  uuid_generate_v4(), [station_id], 'Customer A', 1000
);
```

## Validation Queries

Run these after seeding:

```sql
-- Check user assignments
SELECT s.name, COUNT(DISTINCT us.user_id) as staff_count,
       COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'owner') as owners
FROM stations s
LEFT JOIN user_stations us ON s.id = us.station_id
LEFT JOIN users u ON us.user_id = u.id
GROUP BY s.id, s.name
HAVING COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'owner') = 0;

-- Verify fuel prices
SELECT s.name, COUNT(DISTINCT fp.fuel_type) as fuel_types,
       COUNT(DISTINCT fp.id) FILTER (WHERE fp.active = true) as active_prices
FROM stations s
LEFT JOIN fuel_prices fp ON s.id = fp.station_id
GROUP BY s.id, s.name
HAVING COUNT(DISTINCT fp.id) FILTER (WHERE fp.active = true) = 0;

-- Check equipment setup
SELECT s.name, 
       COUNT(DISTINCT p.id) as pumps,
       COUNT(DISTINCT n.id) as nozzles
FROM stations s
LEFT JOIN pumps p ON s.id = p.station_id
LEFT JOIN nozzles n ON p.id = n.pump_id
GROUP BY s.id, s.name
HAVING COUNT(DISTINCT p.id) = 0 OR COUNT(DISTINCT n.id) = 0;
```

## Common Issues

1. **Missing Owners**
   - Every station must have at least one owner
   - Check: `SELECT * FROM stations WHERE id NOT IN (SELECT station_id FROM user_stations WHERE role = 'owner')`

2. **Invalid Readings**
   - Nozzle readings must be sequential
   - Check: `SELECT * FROM nozzles WHERE current_reading < initial_reading`

3. **Orphaned Records**
   - Foreign keys should be valid
   - Check: `SELECT * FROM user_stations WHERE user_id NOT IN (SELECT id FROM users)`

## Scripts

```bash
# Basic seed
npm run db:seed

# Seed with test data
npm run db:seed -- --test

# Seed specific tables
npm run db:seed -- --tables=users,stations

# Validate after seeding
npm run db:validate
```
