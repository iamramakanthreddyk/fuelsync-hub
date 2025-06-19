# FuelSync Hub - Database Operations Guide

This guide explains when and how to use the various database scripts in the FuelSync Hub project.

## Quick Reference

| Scenario | Command | Description |
|----------|---------|-------------|
| **Initial Setup** | `npm run db:setup` | Complete setup of database, schemas, and seed data |
| **Fix Data Issues** | `npm run db:fix` | Fix relationships between entities (stations, pumps, users) |
| **Reset Database** | `npm run db:reset` | Reset database to initial state with seed data |
| **Check Connection** | `npm run db:check` | Verify database connection |

## Common Scenarios

### 1. First-time Setup

When setting up the project for the first time:

```bash
npm run db:setup
```

This will:
- Create database schema
- Set up tenant schemas
- Create admin user
- Seed initial data
- Fix all relationships

### 2. Fixing Data Issues

If you encounter issues with missing relationships (e.g., "Station ID is required" or "stations.map is not a function"):

```bash
npm run db:fix
```

This will:
- Ensure all tenants have stations
- Ensure all stations have pumps and nozzles
- Ensure all users are assigned to stations
- Create fuel prices for all stations

### 3. Database Verification

To verify the database is set up correctly:

```bash
npm run db:verify-seed
```

This will check that all required seed data exists.

### 4. Resetting the Database

If you need to reset the database to a clean state:

```bash
npm run db:reset
```

This will drop and recreate all tables and seed data.

## Understanding the Data Flow

1. **Tenants** are the top-level entities
2. **Users** belong to tenants
3. **Stations** belong to tenants
4. **Users** are assigned to **stations** through the `user_stations` table
5. **Pumps** belong to stations
6. **Nozzles** belong to pumps
7. **Sales** are recorded through nozzles

## Common Issues and Solutions

### "Station ID is required"

This occurs when a user tries to access the dashboard without being assigned to any stations.

**Solution**: Run `npm run db:fix` to ensure all users are assigned to stations.

### "stations.map is not a function"

This occurs when the stations data is not an array, often because the user doesn't have access to any stations.

**Solution**: Run `npm run db:fix` to ensure all users are assigned to stations.

### "Station must have at least one active pump"

This occurs when trying to create a station without pumps.

**Solution**: Run `npm run db:fix` to ensure all stations have pumps.

## Advanced Operations

### Adding New Tenants

When adding new tenants, ensure they have:
1. At least one station
2. At least one pump per station
3. At least one nozzle per pump
4. Users assigned to stations

The `db:fix` script will handle this automatically.

### Database Migrations

For schema changes:

```bash
npm run db:migrate
```

To roll back migrations:

```bash
npm run db:rollback
```

To check migration status:

```bash
npm run db:status
```