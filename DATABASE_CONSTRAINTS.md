# FuelSync Hub - Database Constraints & Issues Documentation

## 🚨 **CRITICAL: Immediate Trigger Behavior**

⚠️ **The database triggers fire IMMEDIATELY on INSERT/UPDATE, NOT at transaction commit.**

This means you cannot create a station and then add a pump - the trigger fires before the pump exists.

## 🔗 **Complete Foreign Key Dependencies**

Based on actual database analysis, the complete dependency chain is:

```
Level 1 (Most Dependent):
├── admin_activity_logs → admin_users
├── admin_sessions → admin_users  
├── admin_notifications → admin_users
├── sales → nozzles, users
├── tender_entries → shifts, users
├── shifts → users, stations
├── day_reconciliations → stations, users
├── nozzle_readings → nozzles, users
└── creditor_payments → creditors, users

Level 2 (Operational Data):
├── fuel_price_history → stations, users
└── fuel_prices → stations, users (CRITICAL - was missing!)

Level 3 (Equipment Hierarchy):
├── nozzles → pumps
└── pumps → stations

Level 4 (Relationships):
├── user_stations → users, stations
└── creditors → stations (optional)

Level 5 (Core Entities):
├── stations → tenants
└── users → tenants

Level 6 (Independent):
├── tenants
├── admin_users
├── admin_settings
└── migrations
```

## 🎯 **Business Rule Triggers**

### 1. **Tenant Constraint**
- **Trigger**: `check_tenant_has_station()`
- **Rule**: Each tenant must have at least one active station
- **Fires**: IMMEDIATELY on tenant INSERT/UPDATE
- **Impact**: Cannot create tenant without active station existing

### 2. **Station Constraint**
- **Trigger**: `check_station_has_pump()`
- **Rule**: Each station must have at least one active pump
- **Fires**: IMMEDIATELY on station INSERT/UPDATE
- **Impact**: Cannot create station without active pump existing

### 3. **Pump Constraint**
- **Trigger**: `check_pump_has_nozzles()`
- **Rule**: Each pump must have at least two active nozzles
- **Fires**: IMMEDIATELY on pump INSERT/UPDATE
- **Impact**: Cannot create pump without nozzles existing

### 4. **Discovered Tables**
The database contains these tables (21 total):
- `admin_activity_logs`, `admin_notifications`, `admin_sessions`, `admin_settings`
- `admin_users`, `creditor_payments`, `creditors`, `day_reconciliations`
- `fuel_price_history`, `fuel_prices` ⚠️ **TWO fuel price tables!**
- `migrations`, `nozzle_readings`, `nozzles`, `pumps`
- `sales`, `shifts`, `stations`, `tenants`, `tender_entries`
- `user_stations`, `users`

## 🛠️ **Seeding Strategy for Immediate Triggers**

Since triggers fire immediately, we use this approach:

### Phase 1: Independent Entities
1. **Admin Users** (no dependencies)

### Phase 2: Pre-create Dependencies
2. **Users** (with temporary tenant_id to avoid tenant constraint)

### Phase 3: Complete Hierarchy Creation
3. **Station + Pump + Nozzles** (in nested transaction)
   ```sql
   BEGIN;
   INSERT INTO stations (...);
   INSERT INTO pumps (..., active=true);  -- IMMEDIATELY satisfies station trigger
   INSERT INTO nozzles (..., active=true);
   COMMIT;
   ```

### Phase 4: Tenant Creation
4. **Tenant** (station already exists to satisfy constraint)
5. **Update users** with actual tenant_id

### Phase 5: Operational Data
6. **Fuel Prices** (both tables: fuel_price_history AND fuel_prices)
7. **User-Station Assignments**

### Phase 6: Schema Replication
8. **Tenant Schemas** (create and populate)

## 🔄 **Reset Strategy - Complete Deletion Order**

```sql
-- Level 1: Most dependent
DELETE FROM admin_activity_logs;
DELETE FROM admin_sessions;
DELETE FROM admin_notifications;
DELETE FROM sales;
DELETE FROM tender_entries;
DELETE FROM shifts;
DELETE FROM day_reconciliations;
DELETE FROM nozzle_readings;
DELETE FROM creditor_payments;

-- Level 2: Operational data (BOTH fuel price tables!)
DELETE FROM fuel_price_history;
DELETE FROM fuel_prices;  -- This was missing and caused issues!

-- Level 3: Equipment hierarchy
DELETE FROM nozzles;
DELETE FROM pumps;

-- Level 4: Relationships
DELETE FROM user_stations;
DELETE FROM creditors;

-- Level 5: Core entities
DELETE FROM stations;
DELETE FROM users;

-- Level 6: Independent
DELETE FROM tenants;
DELETE FROM admin_users;
DELETE FROM admin_settings;
DELETE FROM migrations;
```

## ⚠️ **Critical Issues Discovered & Fixed**

### 1. **Missing fuel_prices Table**
- **Issue**: There are TWO fuel price tables: `fuel_price_history` AND `fuel_prices`
- **Problem**: The reset script was only clearing `fuel_price_history`
- **Impact**: `fuel_prices` had 18 rows and was blocking station/user deletion
- **Solution**: Clear both tables in deletion order

### 2. **Immediate Trigger Firing**
- **Issue**: Triggers fire on INSERT, not at COMMIT
- **Problem**: Cannot create station then pump - must create pump immediately
- **Solution**: Use nested transactions with immediate pump creation

### 3. **Tenant-Station Circular Dependency**
- **Issue**: Tenant needs station (trigger), Station needs tenant (FK)
- **Solution**: Create station with temporary tenant_id, then create actual tenant

### 4. **Schema vs Table Structure Mismatch**
- **Issue**: Schema file didn't match actual database structure
- **Problem**: Missing NOT NULL fields like `installation_date`, `initial_reading`, `current_reading`
- **Solution**: Check actual table structure before seeding

### 5. **Multi-Tenant Architecture Confusion**
- **Issue**: Plan service querying tenant schemas instead of public schema
- **Problem**: `SET search_path TO tenant_schema` but stations table is in public schema
- **Error**: `relation "stations" does not exist`
- **Solution**: Query `public.stations` with `tenant_id` filter instead of schema switching

### 6. **Trigger Names Mismatch**
- **Issue**: Trigger removal scripts used wrong trigger names
- **Problem**: `check_tenant_has_station_trigger` vs `check_tenant_station_trigger`
- **Solution**: Check actual trigger names before removal

### 7. **Missing Required Fields**
- **Issue**: Database has additional NOT NULL fields not in schema
- **Examples**: 
  - `pumps.installation_date` (required)
  - `nozzles.initial_reading` (required)
  - `nozzles.current_reading` (required)
  - `fuel_price_history.created_by` (required)
- **Solution**: Include ALL required fields in INSERT statements

## 🎯 **Verification Queries**

After seeding, verify constraints are satisfied:

```sql
-- Check tenant has stations
SELECT t.name, COUNT(s.id) as station_count
FROM tenants t
LEFT JOIN stations s ON t.id = s.tenant_id AND s.active = true
GROUP BY t.id, t.name;

-- Check stations have active pumps
SELECT s.name, COUNT(p.id) as pump_count
FROM stations s
LEFT JOIN pumps p ON s.id = p.station_id AND p.active = true
GROUP BY s.id, s.name;

-- Check pumps have active nozzles
SELECT p.name, COUNT(n.id) as nozzle_count
FROM pumps p
LEFT JOIN nozzles n ON p.id = n.pump_id AND n.active = true
GROUP BY p.id, p.name;

-- Check both fuel price tables
SELECT 'fuel_price_history' as table_name, COUNT(*) as count FROM fuel_price_history
UNION ALL
SELECT 'fuel_prices' as table_name, COUNT(*) as count FROM fuel_prices;

-- Check actual table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'your_table' AND table_schema = 'public'
ORDER BY ordinal_position;
```

## 🚨 **Azure PostgreSQL Limitations**

### Cannot Use:
- `SET session_replication_role = replica` (Permission denied)
- `ALTER TABLE ... DISABLE TRIGGER` (Permission denied)
- `TRUNCATE CASCADE` (May not work with immediate triggers)
- `DROP TRIGGER` on system triggers (Permission denied)

### Must Use:
- **Immediate satisfaction** of triggers during INSERT
- **Nested transactions** for complex hierarchies
- **Proper deletion order** respecting all foreign keys
- **ON CONFLICT handling** for existing data
- **CASCADE** when dropping triggers with dependencies

## 📋 **Troubleshooting Guide**

| Error | Cause | Solution |
|-------|-------|----------|
| "Station must have at least one active pump" | Immediate trigger firing | Create pump immediately after station |
| "Tenant must have at least one active station" | Immediate trigger firing | Create station before tenant |
| "Pump must have at least two active nozzles" | Immediate trigger firing | Create nozzles immediately after pump |
| "violates foreign key constraint fuel_prices_station_id_fkey" | Missing fuel_prices in deletion order | Clear fuel_prices before stations |
| "violates foreign key constraint fuel_prices_created_by_fkey" | Missing fuel_prices in deletion order | Clear fuel_prices before users |
| "duplicate key value violates unique constraint" | Existing data conflicts | Use ON CONFLICT clauses |
| "null value in column X violates not-null constraint" | Missing required field | Check table structure and include all NOT NULL fields |
| "relation 'stations' does not exist" | Wrong schema context | Use `public.stations` instead of tenant schema |
| "cannot drop function because other objects depend on it" | Trigger dependencies | Use `DROP ... CASCADE` |

## 🎯 **Best Practices**

### For Development:
1. **Always use `npm run db:reset`** - handles all constraints properly
2. **Never create station without immediate pump** - triggers fire immediately
3. **Check both fuel price tables** - there are two different ones
4. **Use nested transactions** for complex hierarchies
5. **Verify table structure** before writing INSERT statements
6. **Query public schema** for main tables, not tenant schemas

### For Production:
1. **Test seeding process** thoroughly in staging
2. **Monitor trigger violations** in logs
3. **Backup before schema changes**
4. **Verify all constraints** after operations
5. **Document any custom triggers** and their behavior

### For Schema Changes:
1. **Check actual database structure** vs schema files
2. **Test with immediate triggers** - don't assume deferred behavior
3. **Update both public and tenant schemas** if using multi-tenant architecture
4. **Verify foreign key relationships** in both directions

## 🔧 **Multi-Tenant Architecture Notes**

### Schema Structure:
- **Public Schema**: Contains main tables (tenants, users, stations, pumps, nozzles, etc.)
- **Tenant Schemas**: Contains tenant-specific replicated data
- **Plan Limits**: Query public schema with tenant_id filter, not tenant schemas

### Common Mistakes:
1. **Querying tenant schema** for tables that exist in public schema
2. **Using `SET search_path`** instead of explicit schema qualification
3. **Assuming tenant schemas** have all the same tables as public schema

### Correct Approach:
```sql
-- ❌ Wrong - queries tenant schema
SET search_path TO tenant_123; 
SELECT COUNT(*) FROM stations;

-- ✅ Correct - queries public schema with tenant filter
SELECT COUNT(*) FROM public.stations WHERE tenant_id = $1;
```

---

**⚠️ CRITICAL**: The database has immediate triggers that cannot be deferred. Always create complete hierarchies (station+pump+nozzles) together to satisfy all constraints immediately. Multi-tenant architecture uses public schema for main tables, tenant schemas for replicated data only.