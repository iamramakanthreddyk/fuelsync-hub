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

Set environment variables first:
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

Then run setup:
```bash
npm run db setup
```

### 2. Fix Data Issues

If you encounter errors like "Station ID is required":

```bash
npm run db fix
```

### 3. Test Database Connection

```bash
npm run db check
```

### 4. Verify Setup

```bash
npm run db verify
```

### 5. Reset Database

```bash
npm run db reset
```

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

## 🐛 Troubleshooting

### Common Issues

#### "Database connection failed"
```bash
# Check your environment variables
echo $DB_HOST $DB_PORT $DB_NAME $DB_USER

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

### Environment Variables

Ensure these environment variables are set:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fuelsync_dev
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
```

## 🔄 Migration Strategy

For production deployments:

1. **Set environment variables**
2. **Run setup**: `npm run db setup`
3. **Verify**: `npm run db verify`
4. **Test application** functionality

---

For more detailed information, see:
- [Project Structure](PROJECT_STRUCTURE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [User Guide](USER_GUIDE.md)