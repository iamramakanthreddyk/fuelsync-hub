# FuelSync Hub - Database Operations Guide

This guide explains the streamlined database operations for FuelSync Hub.

## 🚀 Quick Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run db:setup` | Complete database setup with seed data | First-time setup or reset |
| `npm run db:check` | Test database connection | Troubleshooting connectivity |
| `npm run db:fix` | Fix user-station relationships | When users can't access stations |
| `npm run db:verify` | Verify database setup | After setup or changes |

## 📁 Essential Database Files

The database management has been streamlined to 4 essential files:

```
backend/db/
├── setup-db.ts          # Schema creation and setup
├── seed.ts              # Data seeding (users, tenants, stations)
├── fix-relationships.ts # Fix user-station relationships
└── check-connection.ts  # Test database connection
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

This runs:
1. Creates database schema (tables, indexes, constraints)
2. Seeds initial data (admin, tenant, users, stations)
3. Creates user-station assignments
4. Sets up tenant schemas

### 2. Fix Data Issues

If you encounter "No stations found" or permission errors:

```bash
cd backend
npm run db:fix
```

This ensures:
- All users are assigned to stations
- User-station relationships are correct
- Permissions are properly set

### 3. Test Database Connection

```bash
cd backend
npm run db:check
```

Use this when:
- Setting up for the first time
- Troubleshooting connection issues
- Verifying environment variables

### 4. Verify Setup

```bash
cd backend
npm run db:verify
```

This checks:
- Required tables exist
- Seed data is present
- Relationships are correct

## 🗄️ Database Schema Overview

### Multi-Tenant Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Public Schema │    │  Tenant Schema  │
│                 │    │                 │
│ • tenants       │    │ • stations      │
│ • users         │    │ • user_stations │
│ • admin_users   │    │ • (tenant data) │
│ • stations      │    │                 │
│ • user_stations │    │                 │
│ • pumps         │    │                 │
│ • nozzles       │    │                 │
│ • sales         │    │                 │
└─────────────────┘    └─────────────────┘
```

### Key Relationships

1. **Tenants** → **Users** (one-to-many)
2. **Users** → **Stations** (many-to-many via user_stations)
3. **Stations** → **Pumps** → **Nozzles** (hierarchical)
4. **Sales** → **Nozzles** (many-to-one)

## 🔐 Default Seed Data

The seed script creates:

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

### Sample Data
- 1 Station with 1 Pump and 2 Nozzles (Petrol/Diesel)
- Fuel prices for both fuel types
- User-station assignments with proper roles

## 🐛 Troubleshooting

### Common Issues

#### "Database connection failed"
```bash
# Check environment variables
echo $DB_HOST $DB_PORT $DB_NAME $DB_USER

# Test connection
cd backend && npm run db:check
```

#### "No stations found for this user"
```bash
# Fix relationships
cd backend && npm run db:fix
```

#### "Permission denied" errors
```bash
# Reset and setup again
cd backend && npm run db:setup
```

#### "Token validation failed"
```bash
# Clear browser storage and re-login
# Or reset database
cd backend && npm run db:setup
```

### Environment Variables

Ensure these environment variables are set:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fuelsync_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

## 🔄 Migration Strategy

For production deployments:

1. **Set environment variables**
2. **Run setup**: `npm run db:setup`
3. **Verify**: `npm run db:verify`
4. **Test application** functionality

## 📊 Database Monitoring

### Check Database Status
```bash
# Connection test
cd backend && npm run db:check

# Verify data integrity
cd backend && npm run db:verify
```

### Performance Tips
- Regular VACUUM and ANALYZE on PostgreSQL
- Monitor connection pool usage
- Index optimization for large datasets

## 🚨 Emergency Procedures

### Complete Reset
```bash
cd backend && npm run db:setup
```

### Backup Before Changes
```bash
pg_dump fuelsync_dev > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup
```bash
psql fuelsync_dev < backup_file.sql
cd backend && npm run db:fix
```

## 📝 Development Notes

- All database scripts use environment variables (no .env files required)
- Connection pooling is handled automatically
- Multi-tenant isolation is enforced at the schema level
- Generated columns (like sales.amount) are calculated automatically

## 🎯 Best Practices

1. **Always set environment variables** before running operations
2. **Use fix command** after manual database changes
3. **Verify setup** after any schema modifications
4. **Monitor logs** for any database errors
5. **Test connection** before running operations

---

For more detailed information, see:
- [Project Structure](PROJECT_STRUCTURE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [User Guide](USER_GUIDE.md)