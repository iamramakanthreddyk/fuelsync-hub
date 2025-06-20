# FuelSync Hub - Seed Data Guide

This guide explains how to seed and verify data in the FuelSync Hub database.

## Understanding the Schema

Before seeding data, it's important to understand the database schema:

1. **Check the schema** of key tables:
   ```bash
   npm run db:check-sales
   npm run db:check-creditors
   npm run db:check-payments
   ```

2. **Key findings**:
   - The `sales` table has a generated column `amount` that is calculated from `sale_volume` and `fuel_price`
   - The `creditors` table requires `station_id`, `party_name` and other fields
   - The `credit_payments` table links payments to creditors

## Seeding Data

Before running any seeding commands, ensure the database is in a clean state by executing:

```bash
npm run db reset
```

This prevents duplicate key errors such as the `admin_users_email_key` issue that can occur when seeding on top of existing data.

### Simple Seed Script

The `simple-seed.ts` script creates:
- A creditor with proper fields linked to a station
- A credit sale with proper fields (excluding generated columns)
- A payment linked to the creditor

```bash
npm run db:seed-simple
```

This script:
1. Uses existing tenant, station, pump, nozzle, and user
2. Creates a new creditor
3. Creates a new credit sale
4. Creates a new payment

### Verifying Seed Data

After seeding, verify the data was created correctly:

```bash
npm run db:verify-seed
```

This will show:
- Recent creditors
- Recent sales
- Recent payments
- Credit sales
- Credit sales summary

## Troubleshooting

### Common Issues

1. **Generated Columns**:
   - Don't include generated columns in INSERT statements
   - For the `sales` table, don't include `amount` as it's calculated from `sale_volume` and `fuel_price`

2. **Column Names**:
   - Column names may vary between environments
   - Use the schema check scripts to verify column names

3. **Foreign Keys**:
   - Ensure all foreign keys exist before inserting data
   - Get existing IDs from the database rather than hardcoding them

### Debugging

If you encounter errors:

1. Check the exact schema of the table:
   ```bash
   npm run db:check-sales
   ```

2. Look for generated columns:
   ```
   amount: numeric (GENERATED ALWAYS AS calc_sale_amount(sale_volume, fuel_price))
   ```

3. Adjust your INSERT statement to exclude generated columns

## Schema Inspection

The schema inspection scripts provide detailed information about tables:

- Column names
- Data types
- Generated columns
- Default values

This information is crucial for creating correct INSERT statements.

## Best Practices

1. **Check First**: Always check the schema before writing seed scripts
2. **Use Existing Data**: Get IDs of existing records rather than creating duplicates
3. **Handle Generated Columns**: Don't include generated columns in INSERT statements
4. **Verify Results**: Always verify the data was created correctly
5. **Use Transactions**: Wrap seed operations in transactions for atomicity

## Scripts Reference

| Script | Description |
|--------|-------------|
| `db:check-sales` | Check the schema of the sales table |
| `db:check-creditors` | Check the schema of the creditors table |
| `db:check-payments` | Check the schema of the credit_payments table |
| `db:seed-simple` | Seed a creditor, credit sale, and payment |
| `db:verify-seed` | Verify the seed data was created correctly |