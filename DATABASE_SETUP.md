# Database Setup and Troubleshooting Guide

## Setting Up the Database

### 1. Create a PostgreSQL Database

First, make sure PostgreSQL is installed and running on your system. Then create a database:

```sql
CREATE DATABASE fuelsync;
```

### 2. Configure Environment Variables

Set your PostgreSQL credentials as environment variables. Example:

```
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_db1
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false
```

### 3. Check Database Connection

Run the connection check script to verify your database connection:

```bash
npm run db:check
```

This will display your connection parameters and test the connection.

### 4. Run Database Setup

Once the connection is working, run the reset command for a clean slate:

```bash
npm run db reset
```

This command cleans the database before seeding to avoid duplicate key errors such as `admin_users_email_key`.

## Troubleshooting Connection Issues

### Error: No pg_hba.conf entry for host

This error occurs when PostgreSQL is configured to reject connections from your IP address or with your credentials.

**Solution:**

1. For Azure PostgreSQL:
   - Make sure your IP address is added to the firewall rules in the Azure portal
   - Verify that you're using the correct server name and credentials
   - Set `DB_SSL=true` in your `.env` file

2. For local PostgreSQL:
   - Locate your PostgreSQL `pg_hba.conf` file
   - Add an entry for your connection
   - Restart PostgreSQL

### Error: Password authentication failed

**Solution:**

1. Verify your password in the `.env` file
2. For Azure PostgreSQL, make sure you're using the full username format: `username@server-name`

### Error: Database does not exist

**Solution:**

1. Create the database:
   ```sql
   CREATE DATABASE fuelsync_db1;
   ```

2. Verify the database name in your `.env` file

### Error: SSL connection required

**Solution:**

The current setup uses SSL with `rejectUnauthorized: false`, which should work with Azure PostgreSQL. If you're still having issues:

1. Make sure `DB_SSL=true` is set in your `.env` file
2. Check if your Azure PostgreSQL server requires a specific SSL configuration

## Troubleshooting Schema Issues

### Error: relation "creditors" does not exist

This error occurs when there's a circular dependency in the schema or when tables are created in the wrong order.

**Solution:**

1. Run the debug script to check the database schema:
   ```bash
   npm run db:debug
   ```

2. If the `creditors` table is missing, try applying the schema in chunks:
   ```bash
   npm run db:schema:chunks
   ```

3. If needed, manually create the missing table:
   ```sql
   CREATE TABLE creditors (
       id UUID PRIMARY KEY,
       party_name VARCHAR(255) NOT NULL,
       contact_person VARCHAR(255),
       contact_phone VARCHAR(20),
       email VARCHAR(255),
       address TEXT,
       credit_limit DECIMAL(10,2),
       running_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
       notes TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Azure PostgreSQL Specific Configuration

The current setup is configured for Azure PostgreSQL with:

```typescript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});
```

This configuration:
- Connects to the Azure PostgreSQL server
- Uses SSL with `rejectUnauthorized: false` to accept self-signed certificates
- Uses the database name, user, and password from the `.env` file

## Database Maintenance

### Backing Up the Database

```bash
pg_dump -U fueladmin -h fuelsync-server.postgres.database.azure.com -d fuelsync_db1 > backup.sql
```

### Restoring from Backup

```bash
psql -U fueladmin -h fuelsync-server.postgres.database.azure.com -d fuelsync_db1 < backup.sql
```

### Resetting the Database

If you need to start fresh:

```bash
npm run db:reset
```

This will drop and recreate all tables, then seed the database with initial data.