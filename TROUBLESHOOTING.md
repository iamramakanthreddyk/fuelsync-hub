# FuelSync Hub - Troubleshooting Guide

## 🚨 **Critical Issues We've Encountered & Fixed**

This document captures all the major issues we faced during development to prevent repeating the same mistakes.

## 🔥 **Database Trigger Issues**

### Issue 1: Immediate Trigger Firing
**Problem**: Database triggers fire IMMEDIATELY on INSERT, not at transaction commit.

**Symptoms**:
```
❌ Seed failed: error: Tenant must have at least one active station
❌ Seed failed: error: Station must have at least one active pump  
❌ Seed failed: error: Pump must have at least two active nozzles
```

**Root Cause**: Trying to create entities in logical order (tenant → station → pump) but triggers check constraints immediately.

**Solution**: Create complete hierarchies in single transactions:
```sql
BEGIN;
INSERT INTO tenants (...);
INSERT INTO stations (...);  -- Satisfies tenant trigger
INSERT INTO pumps (...);     -- Satisfies station trigger  
INSERT INTO nozzles (...);   -- Satisfies pump trigger
COMMIT;
```

**Prevention**: Always create dependent entities immediately after their parents.

---

### Issue 2: Missing Tables in Deletion Order
**Problem**: Foreign key constraints preventing deletion due to missing dependent tables.

**Symptoms**:
```
⚠️ Could not clear stations: violates foreign key constraint "fuel_prices_station_id_fkey"
⚠️ Could not clear users: violates foreign key constraint "fuel_prices_created_by_fkey"
```

**Root Cause**: There are TWO fuel price tables (`fuel_price_history` AND `fuel_prices`) but only one was in deletion order.

**Solution**: Include ALL dependent tables in proper deletion order:
```sql
DELETE FROM fuel_price_history;  -- Both tables needed!
DELETE FROM fuel_prices;         -- This was missing!
DELETE FROM stations;
DELETE FROM users;
```

**Prevention**: Use `npm run db:check-tables` to discover all tables before writing deletion scripts.

---

## 🏗️ **Schema vs Reality Mismatches**

### Issue 3: NOT NULL Constraints Not in Schema File
**Problem**: Seed scripts failing due to missing required fields.

**Symptoms**:
```
❌ null value in column "installation_date" violates not-null constraint
❌ null value in column "initial_reading" violates not-null constraint
❌ null value in column "current_reading" violates not-null constraint
```

**Root Cause**: Schema file didn't reflect actual database structure with additional NOT NULL fields.

**Solution**: Check actual table structure before writing INSERT statements:
```bash
npm run db:check-tables
```

**Prevention**: Always verify table structure matches your assumptions before coding.

---

### Issue 4: Multi-Tenant Schema Confusion
**Problem**: Services querying wrong schema causing "relation does not exist" errors.

**Symptoms**:
```
❌ Error checking station limit: relation "stations" does not exist
[PERMISSION] Access granted for owner@demofuel.com (owner) to manage_stations
```

**Root Cause**: Plan service using `SET search_path TO tenant_schema` but stations table is in public schema.

**Wrong Approach**:
```sql
SET search_path TO tenant_123;
SELECT COUNT(*) FROM stations;  -- ❌ stations not in tenant schema
```

**Correct Approach**:
```sql
SELECT COUNT(*) FROM public.stations WHERE tenant_id = $1;  -- ✅
```

**Prevention**: Understand multi-tenant architecture - main tables in public schema, replicated data in tenant schemas.

---

## 🔧 **Trigger Management Issues**

### Issue 5: Cannot Disable System Triggers
**Problem**: Azure PostgreSQL prevents disabling system triggers.

**Symptoms**:
```
❌ permission denied: "RI_ConstraintTrigger_a_68756" is a system trigger
```

**Root Cause**: Trying to disable system-level triggers without proper permissions.

**Solution**: Remove triggers with CASCADE and correct names:
```sql
DROP TRIGGER IF EXISTS check_tenant_station_trigger ON tenants CASCADE;
DROP FUNCTION IF EXISTS check_tenant_has_station() CASCADE;
```

**Prevention**: Check actual trigger names and use CASCADE for dependencies.

---

## 🗃️ **Data Seeding Issues**

### Issue 6: Circular Dependencies
**Problem**: Tenant needs station (trigger) but station needs tenant (FK).

**Symptoms**: Cannot create either tenant or station first.

**Solution**: Use temporary IDs or create in single transaction:
```sql
BEGIN;
-- Create with same UUID for both
INSERT INTO tenants (id, ...) VALUES ('uuid-123', ...);
INSERT INTO stations (id, tenant_id, ...) VALUES ('uuid-456', 'uuid-123', ...);
INSERT INTO pumps (id, station_id, ...) VALUES ('uuid-789', 'uuid-456', ...);
COMMIT;
```

**Prevention**: Plan entity creation order considering both FK constraints and business rule triggers.

---

### Issue 7: Missing Primary Keys
**Problem**: Tables requiring explicit ID values.

**Symptoms**:
```
❌ null value in column "id" violates not-null constraint
```

**Root Cause**: Some tables don't have DEFAULT gen_random_uuid() and need explicit IDs.

**Solution**: Always provide explicit UUIDs:
```sql
INSERT INTO fuel_price_history (id, station_id, ...) 
VALUES (gen_random_uuid(), $1, ...);
```

**Prevention**: Check table defaults and provide IDs when needed.

---

## 🔌 **Connection & Environment Issues**

### Issue 8: Database Connection Pool Issues
**Problem**: Using different connection methods causing inconsistencies.

**Symptoms**: Tables exist in manual checks but not in application.

**Root Cause**: Different connection configurations between scripts and application.

**Solution**: Use centralized connection pool:
```typescript
import pool from './dbPool';  // ✅ Consistent connection
```

**Prevention**: Always use the same connection pool across all database operations.

---

## 🎯 **Development Workflow Issues**

### Issue 9: Incomplete Reset Process
**Problem**: Partial resets leaving inconsistent state.

**Symptoms**: Some data exists, some doesn't, causing constraint violations.

**Solution**: Always use complete reset:
```bash
npm run db:reset  # Complete reset including schema recreation
```

**Prevention**: Use atomic operations - either complete reset or no reset.

---

### Issue 10: Frontend Caching Old Data
**Problem**: Frontend showing data that doesn't exist in database.

**Symptoms**: Admin panel shows users but database queries return empty.

**Root Cause**: Frontend caching or calling different endpoints.

**Solution**: Clear browser cache and verify API endpoints.

**Prevention**: Implement proper cache invalidation strategies.

---

## 📋 **Quick Diagnostic Commands**

### When Things Go Wrong:

```bash
# 1. Check if database is accessible
npm run db:check

# 2. Check what tables actually exist and their structure
npm run db:check-tables

# 3. Check what data exists
npm run db:check-data

# 4. Complete reset (fixes most issues)
npm run db:reset

# 5. Check admin user exists
npm run db:check-admin
```

### Error Pattern Recognition:

| Error Pattern | Likely Cause | Quick Fix |
|---------------|--------------|-----------|
| "must have at least one" | Immediate trigger | `npm run db:reset` |
| "violates foreign key constraint" | Missing dependent table | Check deletion order |
| "null value in column X" | Missing required field | `npm run db:check-tables` |
| "relation does not exist" | Wrong schema context | Check public vs tenant schema |
| "duplicate key value" | Existing data conflict | Use ON CONFLICT clauses |
| "permission denied" | System trigger/constraint | Use CASCADE or different approach |

---

## 🛡️ **Prevention Strategies**

### Before Writing Database Code:
1. **Check actual table structure**: `npm run db:check-tables`
2. **Understand trigger behavior**: Immediate vs deferred
3. **Map foreign key dependencies**: Plan deletion/creation order
4. **Verify schema architecture**: Public vs tenant schemas

### During Development:
1. **Use consistent connection pools**: Import from same source
2. **Test with clean state**: `npm run db:reset` frequently
3. **Handle constraints properly**: ON CONFLICT, CASCADE, etc.
4. **Verify after changes**: Check data exists where expected

### Before Deployment:
1. **Test complete reset process**: Ensure reproducible setup
2. **Document any custom triggers**: Behavior and dependencies
3. **Verify multi-tenant queries**: Public schema with tenant_id filters
4. **Test with different user roles**: Ensure permissions work

---

## 🎯 **Key Learnings**

### Database Design:
- **Immediate triggers** require different seeding strategies than deferred triggers
- **Multi-tenant architecture** needs careful schema management
- **Business rule enforcement** at database level can complicate application logic

### Development Process:
- **Schema files** may not reflect actual database structure
- **Manual verification** is essential before writing code
- **Atomic operations** prevent inconsistent states

### Azure PostgreSQL:
- **Limited administrative privileges** prevent some trigger management
- **System triggers** cannot be disabled by regular users
- **CASCADE operations** needed for dependent objects

---

**💡 Remember**: When in doubt, use `npm run db:reset` and `npm run db:check-tables` to understand the current state before making changes. Most issues stem from assumptions about database structure or behavior that don't match reality.