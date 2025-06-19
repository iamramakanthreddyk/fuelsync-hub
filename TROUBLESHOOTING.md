# Troubleshooting Guide

## Database Connection Issues

### Error: No pg_hba.conf entry for host "83.221.81.131", user "fueladmin", database "fuelsync_db1", no encryption

This error indicates that your PostgreSQL server is rejecting the connection from your client. This is typically due to PostgreSQL's host-based authentication configuration.

**Solution:**

1. **Check your environment variables**:
   Make sure your database connection parameters are correct:
   ```
   DB_HOST=fuelsync-server.postgres.database.azure.com
   DB_PORT=5432
   DB_NAME=fuelsync_db1
   DB_USER=fueladmin
   DB_PASSWORD=your_password
   DB_SSL=true
   ```

2. **Azure PostgreSQL Firewall Rules**:
   - Log in to the Azure Portal
   - Navigate to your PostgreSQL server
   - Go to "Connection security"
   - Add your client IP address to the firewall rules

3. **Run the connection check script**:
   ```bash
   npm run db:check
   ```

## Schema Creation Issues

### Error: relation "creditors" does not exist

This error occurs when the database is trying to reference a table that doesn't exist yet.

**Solutions:**

1. **Apply schema in chunks**:
   ```bash
   npm run db:schema:chunks
   ```
   This will apply the schema in smaller chunks, making it easier to identify where the issue is occurring.

2. **Debug the schema**:
   ```bash
   npm run db:debug
   ```
   This will check which tables, enums, and functions exist in the database.

3. **Check for circular dependencies**:
   The error might be caused by circular dependencies between tables. Make sure tables are created in the correct order.

4. **Manually create the missing table**:
   If needed, you can manually create the missing table:
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

## Azure PostgreSQL Specific Issues

The current setup uses the following configuration for Azure PostgreSQL:

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

Common issues with Azure PostgreSQL:

1. **SSL is required**: Azure PostgreSQL requires SSL connections. The current setup disables certificate validation with `rejectUnauthorized: false`.

2. **Firewall rules**: Azure PostgreSQL has a firewall that blocks connections from unauthorized IP addresses. Make sure your IP is added to the allowed list.

3. **Username format**: Azure PostgreSQL often requires the username to be in the format `username@server-name`. Check if your DB_USER environment variable includes the server name.

4. **Connection limits**: Azure PostgreSQL has connection limits based on your pricing tier. Make sure you're not exceeding these limits.

## Step-by-Step Troubleshooting

1. **Check database connection**:
   ```bash
   npm run db:check
   ```

2. **Debug the schema**:
   ```bash
   npm run db:debug
   ```

3. **Apply schema in chunks**:
   ```bash
   npm run db:schema:chunks
   ```

4. **Check Azure PostgreSQL logs**:
   - Log in to the Azure Portal
   - Navigate to your PostgreSQL server
   - Go to "Logs" to check for any error messages

5. **Check firewall rules**:
   - Log in to the Azure Portal
   - Navigate to your PostgreSQL server
   - Go to "Connection security"
   - Make sure your IP address is in the allowed list

6. **Verify SSL settings**:
   The current setup uses SSL with `rejectUnauthorized: false`. This should work with Azure PostgreSQL, but if you're still having issues, you might need to configure SSL differently.

### Database Connection Errors (Azure)

If you encounter `ENETUNREACH` or `SELF_SIGNED_CERT` errors when connecting to the database, verify that your scripts load the environment configuration correctly:

```ts
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

This pattern ensures compatibility with Azure-hosted PostgreSQL instances where SSL is enforced.
