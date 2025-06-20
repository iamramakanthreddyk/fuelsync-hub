# Tenant Schema Setup Guide

## Multi-Tenant Architecture

FuelSync Hub uses a schema-per-tenant approach for multi-tenancy:

1. The `public` schema contains shared tables like `tenants` and `admin_users`
2. Each tenant gets its own schema named `tenant_[uuid]` with isolated tables

## Setting Up Tenant Schemas

After running the main database setup, you need to create schemas for each tenant:

```bash
npm run db:tenant-schemas
```

This script:
1. Retrieves all tenants from the `tenants` table
2. Creates a schema for each tenant named `tenant_[uuid]` (with hyphens replaced by underscores)
3. Creates enum types in each tenant schema
4. Creates tables, indexes, functions, and triggers in each tenant schema

## Copying Users to Tenant Schemas

After creating tenant schemas, you need to copy users from the public schema to each tenant schema:

```bash
npm run db:copy-users
```

This script:
1. Retrieves all tenants from the `tenants` table
2. For each tenant, retrieves users with matching tenant_id from the public schema
3. Copies each user to the tenant's schema

This step is crucial because:
- Authentication happens in the public schema
- But most operations happen in the tenant schema
- Users need to exist in both schemas

## Verifying Tenant Schemas

To verify that tenant schemas are set up correctly:

```bash
npm run db:verify-schemas
```

This script:
1. Retrieves all tenants from the `tenants` table
2. Checks if the schema exists for each tenant
3. Checks if enum types, tables, functions, and triggers exist in each schema

## Troubleshooting Tenant Context Issues

### Error: Tenant context not set

This error occurs when:
1. The tenant middleware isn't setting the schema name correctly
2. The tenant schema doesn't exist in the database
3. The enum types don't exist in the tenant schema

**Solutions:**

1. **Create tenant schemas**:
   ```bash
   npm run db:tenant-schemas
   ```
   This will create schemas for all tenants in the database.

2. **Copy users to tenant schemas**:
   ```bash
   npm run db:copy-users
   ```
   This will copy users from the public schema to each tenant schema.

3. **Verify tenant schemas**:
   ```bash
   npm run db:verify-schemas
   ```
   This will check if schemas, enum types, tables, functions, and triggers exist for each tenant.

4. **Check the tenant middleware**:
   Make sure the tenant middleware is setting the `schemaName` property on the request:
   ```typescript
   req.schemaName = `tenant_${req.user.tenant_id.replace(/-/g, '_')}`;
   ```

### Error: relation "tenants" does not exist

This error occurs when a query is trying to access the `tenants` table in a tenant schema, but the table only exists in the public schema.

**Solution:**

1. **Qualify table names with schema**:
   ```typescript
   // Instead of
   const query = `SELECT * FROM tenants WHERE id = $1`;
   
   // Use
   const query = `SELECT * FROM public.tenants WHERE id = $1`;
   ```

2. **Copy necessary data to tenant schemas**:
   If you need tenant data in the tenant schema, copy it from the public schema:
   ```typescript
   await client.query(`
     INSERT INTO "${schemaName}".tenants
     SELECT * FROM public.tenants WHERE id = $1
   `, [tenantId]);
   ```

## Schema Structure in Each Tenant Schema

Each tenant schema contains:

1. **Enum Types**:
   - `user_role`: superadmin, owner, manager, employee
   - `station_user_role`: owner, manager, attendant
   - `payment_method`: cash, card, upi, credit, mixed
   - `sale_status`: pending, posted, voided
   - `subscription_plan`: basic, premium, enterprise
   - `tenant_status`: active, suspended, deleted
   - `fuel_type`: petrol, diesel, premium, super, cng, lpg
   - `creditor_payment_method`: cash, bank_transfer, check, upi, credit_card, debit_card
   - `shift_status`: open, closed, reconciled
   - `tender_type`: cash, card, upi, credit

2. **Tables**:
   - `users`: User information
   - `stations`: Station information
   - `user_stations`: User-station assignments
   - `pumps`: Pump information
   - `nozzles`: Nozzle information
   - `nozzle_readings`: Nozzle reading history
   - `creditors`: Creditor information
   - `fuel_price_history`: Fuel price history
   - `sales`: Sales records
  - `credit_payments`: Creditor payment records
   - `shifts`: Shift records
   - `tender_entries`: Tender entries
   - `day_reconciliations`: Day reconciliation records

3. **Functions**:
   - `round_decimal`: Rounds a decimal value to a specified number of places
   - `calc_sale_amount`: Calculates the sale amount from volume and price
   - `update_fuel_price_effective_to`: Updates the effective_to date of previous fuel prices

4. **Triggers**:
   - `set_fuel_price_effective_to`: Automatically updates the effective_to date of previous fuel prices

## Common Issues

### 1. Missing Enum Types

If enum types don't exist in the tenant schema, you'll get errors like:
```
error: type "subscription_plan" does not exist
```

**Solution:** Run the tenant schema creation script:
```bash
npm run db:tenant-schemas
```

### 2. Transaction Aborted

If you see an error like:
```
error: current transaction is aborted, commands ignored until end of transaction block
```

This means an error occurred in a transaction and the transaction was rolled back.

**Solution:** The updated tenant schema creation script uses separate transactions for each tenant, so if one tenant fails, the others can still succeed.

### 3. Schema Name Format

The schema name must match the tenant ID format exactly (with hyphens replaced by underscores).

**Solution:** Check the tenant middleware to ensure it's formatting the schema name correctly:
```typescript
req.schemaName = `tenant_${req.user.tenant_id.replace(/-/g, '_')}`;
```

### 4. Permission Issues

The database user might not have permission to create schemas or objects in schemas.

**Solution:** Grant the necessary permissions:
```sql
GRANT CREATE ON DATABASE [db_name] TO [db_user];
GRANT ALL PRIVILEGES ON SCHEMA tenant_[tenant_uuid] TO [db_user];
```