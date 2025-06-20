# FuelSync Hub - Database Operations Guide

## 🚀 Quick Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run db:reset` | **RECOMMENDED** - Complete clean reset | Most issues, clean development |
| `npm run db:setup` | Initial setup only | First-time deployment |
| `npm run db:check` | Test database connection | Troubleshooting connectivity |
| `npm run db:fix` | Fix user-station relationships only | When users can't access stations |
| `npm run db:verify` | Verify database setup | After setup or changes |
| `npm run db:check-tables` | Check actual table structures | Before writing seed scripts |

## 🚨 **CRITICAL DATABASE BEHAVIOR**

⚠️ **This database has IMMEDIATE TRIGGERS that fire on INSERT, not at transaction commit.**

**Key Constraints:**
- **Tenants** must have ≥1 active station (checked immediately)
- **Stations** must have ≥1 active pump (checked immediately)  
- **Pumps** must have ≥2 active nozzles (checked immediately)
- **Complex foreign key chain** with 21 tables including TWO fuel price tables
- **Multi-tenant architecture** with public schema + tenant schemas

**See [DATABASE_CONSTRAINTS.md](DATABASE_CONSTRAINTS.md) for complete technical details.**

## 📁 Database Management Files

```
backend/db/
├── setup-db.ts          # Schema creation
├── seed.ts              # Immediate trigger-compliant seeding
├── fix-relationships.ts # Fix user-station relationships
├── reset-db.ts          # Complete database cleanup (all 21 tables)
├── check-connection.ts  # Test database connection
├── check-tables.ts      # Check actual table structures
└── check-admin.ts       # Verify admin user exists
```

## 🔧 Environment Setup

### Required Environment Variables

```bash
# Unix/Linux/macOS
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false

# Windows PowerShell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="fuelsync_dev"
$env:DB_USER="postgres"
$env:DB_PASSWORD="postgres"
$env:DB_SSL="false"
```

## 🔧 Common Scenarios

### 1. **Most Common: Clean Reset (RECOMMENDED)**

```bash
cd backend
npm run db:reset
```

**Use this for:**
- Any constraint/trigger errors
- Development environment setup
- After code changes
- When things aren't working properly
- Schema structure mismatches

### 2. **First-Time Production Setup**

```bash
cd backend
npm run db:setup
```

**Use this for:**
- Initial production deployment
- Fresh database setup

### 3. **Connection Issues**

```bash
cd backend
npm run db:check
```

### 4. **User Assignment Issues Only**

```bash
cd backend
npm run db:fix
```

**Use this for:**
- "No stations found" errors
- User permission issues
- After manual user changes

### 5. **Check Table Structures Before Coding**

```bash
cd backend
npm run db:check-tables
```

**Use this for:**
- Before writing seed scripts
- Verifying NOT NULL constraints
- Understanding actual vs expected schema

## 🔄 **How the Reset Process Works**

### 1. **Complete Reset Phase** (`reset-db.ts`)
- **Discovers all 21 tables** dynamically from database
- **Drops tenant schemas** (CASCADE removes dependencies)
- **Deletes in complete dependency order**:
  ```
  admin_activity_logs → admin_sessions → sales → 
  fuel_price_history → fuel_prices → nozzles → pumps → 
  user_stations → stations → users → tenants → admin_users
  ```
- **Handles missing tables gracefully**

### 2. **Schema Recreation** (`setup-db.ts`)
- **Creates fresh schema** with all tables and constraints
- **Sets up triggers** and business rules

### 3. **Immediate Trigger-Compliant Seeding** (`seed.ts`)
- **Pre-creates users** with temporary tenant_id
- **Creates station+pump+nozzles immediately** (satisfies triggers)
- **Creates tenant** (station already exists)
- **Updates relationships** and creates operational data
- **Replicates to tenant schemas**

### 4. **Relationship Fixing** (`fix-relationships.ts`)
- **Ensures user-station assignments** exist
- **Works with existing data** (doesn't recreate)

## 🗄️ **Database Structure Overview**

### Discovered Tables (21 Total)
```
Core Business:
├── tenants, users, stations, pumps, nozzles
├── user_stations, sales, creditors

Operational:
├── fuel_price_history, fuel_prices (TWO fuel price tables!)
├── nozzle_readings, shifts, tender_entries
├── day_reconciliations, creditor_payments

Admin:
├── admin_users, admin_sessions, admin_activity_logs
├── admin_notifications, admin_settings

System:
└── migrations
```

### Multi-Tenant Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Public Schema │    │  Tenant Schema  │
│                 │    │                 │
│ • tenants ──────┼────┤ • stations      │
│ • users         │    │ • user_stations │
│ • admin_users   │    │                 │
│ • stations ─────┼────┤                 │
│ • user_stations │    │                 │
│ • pumps         │    │                 │
│ • nozzles       │    │                 │
│ • sales         │    │                 │
│ • fuel_prices   │    │                 │
└─────────────────┘    └─────────────────┘
```

### Critical Constraints
- **Immediate triggers** (fire on INSERT, not COMMIT)
- **Tenant → Station dependency** (circular with triggers)
- **Station → Pump dependency** (immediate check)
- **Pump → Nozzles dependency** (immediate check, needs ≥2)
- **Complex foreign key chain** across all 21 tables

## 🔐 **Default Seed Data**

### Login Credentials
| Role | Email | Password | Access |
|------|-------|----------|---------|
| **Admin** | admin@fuelsync.com | admin123 | Platform management |
| **Owner** | owner@demofuel.com | password123 | All stations |
| **Manager** | manager@demofuel.com | password123 | Assigned stations |
| **Employee** | employee@demofuel.com | password123 | Single station |

### Created Data
- **1 Tenant**: Demo Company
- **3 Users**: Owner, Manager, Employee (all roles)
- **1 Station**: Main Station (satisfies tenant constraint)
- **1 Pump**: Pump 1 - ACTIVE (satisfies station constraint)
- **2 Nozzles**: Petrol & Diesel - ACTIVE (satisfies pump constraint)
- **Fuel Prices**: Set in BOTH fuel price tables
- **User Assignments**: All users assigned to station
- **Tenant Schema**: Complete replication

## 🐛 **Troubleshooting**

### Immediate Solutions

| Error Message | Solution | Why |
|---------------|----------|-----|
| "Station must have at least one active pump" | `npm run db:reset` | Immediate trigger - needs complete reset |
| "Tenant must have at least one active station" | `npm run db:reset` | Immediate trigger - needs complete reset |
| "Pump must have at least two active nozzles" | `npm run db:reset` | Immediate trigger - needs complete reset |
| "violates foreign key constraint fuel_prices_*" | `npm run db:reset` | Missing fuel_prices table in deletion |
| "null value in column X violates not-null constraint" | `npm run db:check-tables` then fix seed | Missing required field |
| "relation 'stations' does not exist" | Check schema context | Querying wrong schema (tenant vs public) |
| "No stations found for this user" | `npm run db:fix` | User assignment issue only |
| "Database connection failed" | `npm run db:check` | Connection/environment issue |
| "duplicate key value violates unique constraint" | `npm run db:reset` | Existing data conflict |
| "cannot drop function because other objects depend on it" | Use `DROP ... CASCADE` | Trigger dependencies |

### Schema vs Reality Issues

| Problem | Check Command | Fix |
|---------|---------------|-----|
| Seed script fails with NOT NULL error | `npm run db:check-tables` | Add missing required fields |
| Table structure doesn't match schema file | `npm run db:check-tables` | Update seed to match actual structure |
| Multi-tenant query fails | Check if querying correct schema | Use `public.table` with tenant_id filter |

### When NOT to Use db:reset
- **Production environments** (use db:setup for initial deployment)
- **When you only need user fixes** (use db:fix)
- **When testing connections** (use db:check)
- **When checking table structures** (use db:check-tables)

## 🎯 **Best Practices**

### Development Workflow
1. **Start with**: `npm run db:reset`
2. **Check table structure**: `npm run db:check-tables` (before writing seeds)
3. **Test application** with all user roles
4. **For user issues only**: `npm run db:fix`
5. **For any other issues**: `npm run db:reset`

### Production Deployment
1. **Set environment variables**
2. **Initial setup**: `npm run db:setup`
3. **Verify**: `npm run db:verify`
4. **Test all functionality**

### Debugging Process
1. **Check environment**: `npm run db:check`
2. **Check table structures**: `npm run db:check-tables`
3. **Reset for clean state**: `npm run db:reset`
4. **Verify constraints**: See [DATABASE_CONSTRAINTS.md](DATABASE_CONSTRAINTS.md)
5. **Test with different user roles**

### Schema Development
1. **Always check actual table structure** before writing INSERT statements
2. **Include ALL NOT NULL fields** in seed scripts
3. **Test with immediate triggers** - don't assume deferred behavior
4. **Query public schema** for main tables, tenant schemas for replicated data
5. **Use explicit schema qualification** (`public.table`) instead of `SET search_path`

## 📊 **Verification Commands**

```bash
# Test connection
npm run db:check

# Check actual table structures
npm run db:check-tables

# Verify complete setup
npm run db:verify

# Check constraint satisfaction (see DATABASE_CONSTRAINTS.md for SQL)
```

## 🚨 **Emergency Procedures**

### Complete System Reset
```bash
cd backend
npm run db:reset
```

### Backup Before Changes
```bash
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Production Recovery
```bash
# Restore from backup
psql your_database < backup_file.sql

# Fix relationships if needed
npm run db:fix
```

## 📝 **Development Notes**

- **21 tables** with complex dependencies
- **Immediate triggers** cannot be deferred
- **Two fuel price tables** must both be handled
- **Azure PostgreSQL** restrictions prevent trigger disabling
- **Nested transactions** required for complex hierarchies
- **ON CONFLICT** handling for existing data
- **Multi-tenant architecture** with public + tenant schemas
- **Schema file may not match reality** - always check actual structure

## 🔧 **Multi-Tenant Architecture Guidelines**

### Schema Usage:
- **Public Schema**: Main business tables (tenants, users, stations, pumps, nozzles, sales, etc.)
- **Tenant Schemas**: Replicated data for tenant isolation
- **Plan Limits**: Always query public schema with tenant_id filter

### Common Mistakes:
```sql
-- ❌ Wrong - queries tenant schema for main tables
SET search_path TO tenant_123; 
SELECT COUNT(*) FROM stations;

-- ✅ Correct - queries public schema with tenant filter
SELECT COUNT(*) FROM public.stations WHERE tenant_id = $1;
```

### Service Layer Guidelines:
- **Plan services**: Query public schema with tenant_id
- **Business services**: Query public schema primarily
- **Tenant-specific services**: May use tenant schemas for replicated data

---

**⚠️ CRITICAL**: This database has immediate triggers and complex multi-tenant architecture. When in doubt, use `npm run db:reset` and `npm run db:check-tables` to understand the actual structure before making changes.

**For technical details**: See [DATABASE_CONSTRAINTS.md](DATABASE_CONSTRAINTS.md)