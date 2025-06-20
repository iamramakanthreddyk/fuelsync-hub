# FuelSync Hub - Database Constraints & Triggers Documentation

## 🚨 Critical Database Constraints

This document explains the database triggers and constraints that must be satisfied during seeding and operations.

### 🔗 **Foreign Key Dependencies**

The database has a complex dependency chain that must be respected during deletion and creation:

```
admin_activity_logs → admin_users
sales → nozzles, users
fuel_price_history → stations, users (created_by)
nozzles → pumps
pumps → stations
user_stations → users, stations
creditors → stations (optional)
stations → tenants
users → tenants
```

### 🎯 **Business Rule Triggers**

#### 1. **Tenant Constraint**
- **Trigger**: `check_tenant_has_station()`
- **Rule**: Each tenant must have at least one active station
- **Impact**: Cannot create tenant without immediately creating a station

#### 2. **Station Constraint**
- **Trigger**: `check_station_has_pump()`
- **Rule**: Each station must have at least one active pump
- **Impact**: Cannot create station without immediately creating a pump

#### 3. **Pump Constraint** (Implied)
- **Rule**: Each pump should have at least one nozzle for operations
- **Impact**: Best practice to create nozzles immediately after pump

### 🛠️ **Seeding Strategy**

To satisfy all constraints, the seeding process follows this **exact order**:

#### Phase 1: Independent Entities
1. **Admin Users** (no dependencies)
2. **Tenants** (no dependencies, but triggers will check for stations)

#### Phase 2: User Creation
3. **Users** (depends on tenants, may be referenced by fuel_price_history)

#### Phase 3: Complete Station Hierarchy (Single Transaction)
4. **Station** (depends on tenant)
5. **Pump** (depends on station, satisfies station trigger)
6. **Nozzles** (depends on pump, completes hierarchy)

#### Phase 4: Operational Data
7. **Fuel Price History** (depends on station, users)
8. **User-Station Assignments** (depends on users, stations)

#### Phase 5: Schema Replication
9. **Tenant Schemas** (create and populate)

### 🔄 **Reset Strategy**

Deletion must follow **reverse dependency order**:

```sql
-- Most dependent first
DELETE FROM admin_activity_logs;
DELETE FROM sales;
DELETE FROM fuel_price_history;
DELETE FROM nozzles;
DELETE FROM pumps;
DELETE FROM user_stations;
DELETE FROM creditors;
DELETE FROM stations;
DELETE FROM users;
DELETE FROM tenants;
DELETE FROM admin_users;
```

### ⚠️ **Common Pitfalls**

#### 1. **Creating Station Without Pump**
```sql
-- ❌ This will fail
INSERT INTO stations (...);
-- Trigger fires: "Station must have at least one active pump"

-- ✅ Correct approach
BEGIN;
INSERT INTO stations (...);
INSERT INTO pumps (...);
COMMIT; -- Triggers check constraints here
```

#### 2. **Creating Tenant Without Station**
```sql
-- ❌ This will fail
INSERT INTO tenants (...);
-- Trigger fires: "Tenant must have at least one active station"

-- ✅ Correct approach
BEGIN;
INSERT INTO tenants (...);
INSERT INTO stations (...);
INSERT INTO pumps (...); -- To satisfy station trigger
COMMIT;
```

#### 3. **Incomplete Deletion**
```sql
-- ❌ This will fail
DELETE FROM stations;
-- Error: "violates foreign key constraint fuel_prices_station_id_fkey"

-- ✅ Correct approach
DELETE FROM fuel_price_history; -- Delete references first
DELETE FROM stations;
```

### 🎯 **Azure PostgreSQL Limitations**

#### Cannot Use These Approaches:
- `SET session_replication_role = replica` (Permission denied)
- `ALTER TABLE ... DISABLE TRIGGER` (Permission denied)
- `TRUNCATE CASCADE` (May not work with triggers)

#### Must Use These Approaches:
- **Single Transaction Seeding** - Create complete hierarchies in one transaction
- **Proper Deletion Order** - Delete in reverse dependency order
- **ON CONFLICT Handling** - Handle existing data gracefully

### 📋 **Verification Checklist**

After seeding, verify these constraints are satisfied:

```sql
-- Check tenant has stations
SELECT t.name, COUNT(s.id) as station_count
FROM tenants t
LEFT JOIN stations s ON t.id = s.tenant_id AND s.active = true
GROUP BY t.id, t.name;

-- Check stations have pumps
SELECT s.name, COUNT(p.id) as pump_count
FROM stations s
LEFT JOIN pumps p ON s.id = p.station_id AND p.active = true
GROUP BY s.id, s.name;

-- Check pumps have nozzles
SELECT p.name, COUNT(n.id) as nozzle_count
FROM pumps p
LEFT JOIN nozzles n ON p.id = n.pump_id AND n.active = true
GROUP BY p.id, p.name;

-- Check users have station assignments
SELECT u.email, COUNT(us.station_id) as assigned_stations
FROM users u
LEFT JOIN user_stations us ON u.id = us.user_id AND us.active = true
GROUP BY u.id, u.email;
```

### 🔄 **Safe Operations**

#### Adding New Data
1. **Always use transactions** for related entities
2. **Create complete hierarchies** (tenant → station → pump → nozzle)
3. **Handle conflicts** with ON CONFLICT clauses

#### Modifying Data
1. **Check dependencies** before deletion
2. **Update in correct order** (children before parents for deletion)
3. **Verify constraints** after operations

#### Testing Changes
1. **Use db:reset** for clean testing environment
2. **Verify all triggers** are satisfied
3. **Test with different user roles** and permissions

---

**⚠️ Important**: Always test database changes with `npm run db:reset` to ensure the seeding process works correctly with all constraints and triggers.