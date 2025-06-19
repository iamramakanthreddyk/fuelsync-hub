# FuelSync Hub - Database Operations Guide

This guide explains the streamlined database operations for FuelSync Hub.

## 🚀 Quick Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run db setup` | Complete database setup | First-time setup |
| `npm run db fix` | Fix data relationships | When relationships are broken |
| `npm run db check` | Test database connection | Troubleshooting connectivity |
| `npm run db verify` | Verify database setup | After setup or changes |
| `npm run db reset` | Reset to clean state | Start fresh |

## 📁 Essential Database Files

The database management has been streamlined to 4 essential files:

```
backend/db/
├── setup-db.ts          # Schema creation and setup
├── seed.ts              # Data seeding (users, tenants, stations)
├── fix-relationships.ts # Fix user-station relationships
└── verify-seed.ts       # Verify database setup
```

## 🔧 Common Scenarios

### 1. First-Time Setup

```bash
# Complete setup (recommended)
npm run db setup
```

This runs:
1. Creates database schema
2. Seeds initial data (admin, tenant, users)
3. Fixes all relationships
4. Verifies setup

### 2. Fix Data Issues

If you encounter errors like "Station ID is required" or "stations.map is not a function":

```bash
npm run db fix
```

This ensures:
- All users are assigned to stations
- All stations have pumps and nozzles
- All relationships are properly connected

### 3. Test Database Connection

```bash
npm run db check
```

Use this when:
- Setting up for the first time
- Troubleshooting connection issues
- Verifying .env configuration

### 4. Verify Setup

```bash
npm run db verify
```

This checks:
- Required tables exist
- Seed data is present
- Relationships are correct

### 5. Reset Database

```bash
npm run db reset
```

**⚠️ Warning**: This will delete all data and recreate everything from scratch.

## 🗄️ Database Schema Overview

### Multi-Tenant Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Public Schema │    │  Tenant Schema  │
│                 │    │                 │
│ • tenants       │    │ • stations      │
│ • users         │    │ • pumps         │
│ • admin_users   │    │ • nozzles       │
│                 │    │ • sales         │
│                 │    │ • user_stations │
│                 │    │ • creditors     │
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
- User-station assignments

## 🐛 Troubleshooting

### Common Issues

#### "Database connection failed"
```bash
# Check your .env file
cat backend/.env

# Test connection
npm run db check
```

#### "Station ID is required"
```bash
# Fix relationships
npm run db fix
```

#### "No stations found"
```bash
# Reset and setup again
npm run db reset
```

#### "Token validation failed"
```bash
# Clear browser storage and re-login
# Or reset database
npm run db reset
```

### Environment Variables

Ensure your `backend/.env` file has:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fuelsync
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
```

## 🔄 Migration Strategy

For production deployments:

1. **Backup existing data** (if any)
2. **Run setup**: `npm run db setup`
3. **Verify**: `npm run db verify`
4. **Test application** functionality

## 📊 Database Monitoring

### Check Database Status
```bash
# Connection test
npm run db check

# Verify data integrity
npm run db verify

# Check logs
tail -f backend/logs/app.log
```

### Performance Tips
- Regular VACUUM and ANALYZE on PostgreSQL
- Monitor connection pool usage
- Index optimization for large datasets

## 🚨 Emergency Procedures

### Complete Reset
```bash
npm run db reset
```

### Backup Before Changes
```bash
pg_dump fuelsync > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup
```bash
psql fuelsync < backup_file.sql
npm run db fix  # Fix any relationship issues
```

## 📝 Development Notes

- All database scripts use TypeScript
- Connection pooling is handled automatically
- Multi-tenant isolation is enforced at the schema level
- Generated columns (like sales.amount) are calculated automatically

## 🎯 Best Practices

1. **Always test connection** before running operations
2. **Use fix command** after manual database changes
3. **Verify setup** after any schema modifications
4. **Backup before reset** in production environments
5. **Monitor logs** for any database errors

---

For more detailed information, see:
- [Project Structure](PROJECT_STRUCTURE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [User Guide](USER_GUIDE.md)