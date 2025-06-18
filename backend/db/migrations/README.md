# Database Migrations

This directory contains database migration scripts for FuelSync Hub.

## Overview

Database migrations are a way to manage changes to your database schema over time. Each migration represents a specific change to the database schema, such as creating a table, adding a column, or modifying data.

## Migration File Format

Each migration file follows this naming convention:
```
YYYYMMDD_HHMMSS_description.sql
```

For example:
```
20250617_210000_create_admin_tables.sql
```

## How to Create a Migration

1. Create a new SQL file in the `migrations` directory with the naming convention above
2. Write the SQL statements for your migration
3. Include both `UP` and `DOWN` sections:
   - `-- UP` section contains the changes to apply
   - `-- DOWN` section contains the commands to revert the changes

Example:
```sql
-- UP
CREATE TABLE IF NOT EXISTS example_table (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOWN
DROP TABLE IF EXISTS example_table;
```

## How to Run Migrations

### Apply Migrations

To apply all pending migrations:
```bash
npm run db:migrate
```

To apply migrations up to a specific version:
```bash
npm run db:migrate -- --to 20250617_210000
```

### Rollback Migrations

To rollback the most recent migration:
```bash
npm run db:rollback
```

To rollback to a specific version:
```bash
npm run db:rollback -- --to 20250617_210000
```

### Check Migration Status

To see which migrations have been applied:
```bash
npm run db:status
```

## Best Practices

1. **Idempotent Migrations**: Use `IF NOT EXISTS` and `IF EXISTS` clauses to make migrations idempotent (can be run multiple times without error)
2. **Atomic Changes**: Each migration should represent a single logical change
3. **Test Migrations**: Always test migrations in a development environment before applying to production
4. **Backward Compatibility**: Ensure migrations maintain backward compatibility with application code
5. **Documentation**: Include comments explaining complex changes
6. **Data Migrations**: For data migrations, consider performance implications for large tables

## Migration Tracking

Migrations are tracked in the `migrations` table:

| Column | Description |
|--------|-------------|
| id | Unique identifier for the migration |
| name | Migration filename |
| applied_at | Timestamp when the migration was applied |
| checksum | Hash of the migration content to detect changes |