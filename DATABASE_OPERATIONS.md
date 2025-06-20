# FuelSync Hub - Database Operations Guide

This guide explains the streamlined database operations for FuelSync Hub.

## 🚀 Quick Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run db:setup` | Complete database setup with seed data | First-time setup |
| `npm run db:reset` | Clean database and setup fresh | When you need a clean slate (RECOMMENDED) |
| `npm run db:clean` | Clean database only (no setup) | Before manual setup |
| `npm run db:check` | Test database connection | Troubleshooting connectivity |
| `npm run db:fix` | Fix user-station relationships | When users can't access stations |
| `npm run db:verify` | Verify database setup | After setup or changes |

## 📁 Essential Database Files

The database management has been streamlined to 5 essential files:

```
backend/db/
├── setup-db.ts          # Schema creation and setup
├── seed.ts              # Trigger-compliant data seeding
├── fix-relationships.ts # Fix user-station relationships
├── reset-db.ts          # Complete database cleanup
└── check-connection.ts  # Test database connection
```

## 🚨 **Critical Database Constraints**

⚠️ **The database has business rule triggers that must be satisfied:**

1. **Tenant Constraint**: Each tenant must have at least one active station
2. **Station Constraint**: Each station must have at least one active pump
3. **Complex Foreign Keys**: Multiple tables reference each other

**See [DATABASE_CONSTRAINTS.md](DATABASE_CONSTRAINTS.md) for complete details.**

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

# Windows CMD
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=fuelsync_dev
set DB_USER=postgres
set DB_PASSWORD=postgres
set DB_SSL=false
```

## 🔧 Common Scenarios

### 1. First-Time Setup

```bash
# Set environment variables (see above)
cd backend
npm run db:setup
```

### 2. Clean Reset (RECOMMENDED for most issues)

```bash
cd backend
npm run db:reset
```

**This is the safest option** - it handles all constraints and triggers properly.

### 3. Fix Data Issues Only

```bash
cd backend
npm run db:fix
```

### 4. Test Database Connection

```bash
cd backend
npm run db:check
```

## 🔄 **How the Reset Process Works**

### Reset Phase (`reset-db.ts`)
1. **Drops tenant schemas** (CASCADE removes all dependencies)
2. **Identifies all tables** dynamically from database
3. **Deletes in dependency order**:
   ```
   admin_activity_logs → sales → fuel_price_history → 
   nozzles → pumps → user_stations → creditors → 
   stations → users → tenants → admin_users
   ```
4. **Handles errors gracefully** (continues if some tables don't exist)

### Seeding Phase (`seed.ts`)
1. **Single Transaction Approach** - All constraints checked at commit
2. **Creates complete hierarchies**:
   - Admin user (independent)
   - Tenant (independent)
   - Users (depends on tenant)
   - Station + Pump + Nozzles (complete hierarchy to satisfy triggers)
   - Fuel prices (depends on station, users)
   - User-station assignments
   - Tenant schema replication

### Fix Phase (`fix-relationships.ts`)
1. **Ensures user-station assignments** exist
2. **Works with existing data** (doesn't recreate)
3. **Handles both public and tenant schemas**

## 🗄️ Database Schema Overview

### Multi-Tenant Architecture with Constraints

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

### Key Constraints
- **Tenants** must have ≥1 active station
- **Stations** must have ≥1 active pump
- **Complex foreign key chain** requires specific deletion order

## 🔐 Default Seed Data

### Admin User
- **Email**: admin@fuelsync.com
- **Password**: admin123
- **Role**: superadmin

### Demo Tenant
- **Name**: Demo Company
- **Email**: demo@company.com

### Tenant Users
| Role | Email | Password |
|------|-------|----------|
| Owner | owner@demofuel.com | password123 |
| Manager | manager@demofuel.com | password123 |
| Employee | employee@demofuel.com | password123 |

### Complete Station Hierarchy
- **Station**: Main Station
- **Pump**: Pump 1 (satisfies station constraint)
- **Nozzles**: Petrol & Diesel (satisfies pump requirements)
- **Fuel Prices**: Set for both fuel types
- **User Assignments**: All users properly assigned

## 🐛 Troubleshooting

### Common Issues & Solutions

#### "Station must have at least one active pump"
```bash
# This is a database trigger - use reset
cd backend && npm run db:reset
```

#### "Tenant must have at least one active station"
```bash
# This is a database trigger - use reset
cd backend && npm run db:reset
```

#### "violates foreign key constraint"
```bash
# Foreign key dependency issue - use reset
cd backend && npm run db:reset
```

#### "No stations found for this user"
```bash
# User-station assignment issue
cd backend && npm run db:fix
```

#### "Database connection failed"
```bash
# Check environment variables
echo $DB_HOST $DB_PORT $DB_NAME $DB_USER
cd backend && npm run db:check
```

#### "Duplicate key value violates unique constraint"
```bash
# Existing data conflict - use reset
cd backend && npm run db:reset
```

### When to Use Each Command

| Issue | Command | Why |
|-------|---------|-----|
| Any constraint/trigger error | `db:reset` | Handles all constraints properly |
| First time setup | `db:setup` | Creates fresh database |
| Users can't access stations | `db:fix` | Fixes assignments only |
| Connection problems | `db:check` | Tests connectivity |
| After code changes | `db:reset` | Ensures clean state |
| Production deployment | `db:setup` | One-time setup |

## 🎯 Best Practices

### Development
1. **Use `npm run db:reset`** for most issues
2. **Set environment variables** before any operation
3. **Test with different user roles** after seeding
4. **Check logs** for constraint violations

### Production
1. **Use `npm run db:setup`** for initial deployment
2. **Backup before changes**: `pg_dump database > backup.sql`
3. **Test migrations** in staging environment first
4. **Monitor constraint violations** in logs

### Debugging
1. **Check constraint documentation**: [DATABASE_CONSTRAINTS.md](DATABASE_CONSTRAINTS.md)
2. **Verify all triggers** are satisfied after operations
3. **Use transaction logs** to understand failures
4. **Test seeding process** regularly

## 📊 Database Monitoring

### Health Checks
```bash
# Test connection
npm run db:check

# Verify data integrity
npm run db:verify

# Check constraint satisfaction
# See DATABASE_CONSTRAINTS.md for SQL queries
```

### Performance Tips
- Monitor connection pool usage
- Regular VACUUM and ANALYZE on PostgreSQL
- Index optimization for large datasets
- Watch for constraint violation patterns

---

**⚠️ Important**: The database has complex business rule triggers. Always use `npm run db:reset` when encountering constraint errors, as it's designed to handle all triggers and dependencies correctly.

For detailed constraint information, see [DATABASE_CONSTRAINTS.md](DATABASE_CONSTRAINTS.md).