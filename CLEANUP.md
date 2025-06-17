# Project Cleanup Guide

The following files and directories can be safely removed as they have been consolidated or replaced:

## Database Files to Remove

- `backend/db/migrations/` - All individual migration files can be removed as they've been consolidated into `schema.sql`
- `backend/db/scripts/` - These scripts have been replaced by `setup-db.ts` and `seed.ts`
- `backend/db/run-migrations.ts` - Replaced by `setup-db.ts`
- `backend/db/schema/complete_schema.sql` - Replaced by `schema.sql`

## Specific Files to Remove

1. `backend/db/migrations/20230615_add_creditor_payment_methods.sql`
2. `backend/db/migrations/20230616_add_tender_entries.sql`
3. `backend/db/migrations/20230617_add_fuel_price_history.sql`
4. `backend/db/migrations/20230618_fix_schema_issues.sql`
5. `backend/db/scripts/migrate.ts`
6. `backend/db/scripts/reset-db.ts`
7. `backend/db/scripts/rollback.ts`
8. `backend/db/scripts/seed.ts`
9. `backend/db/scripts/validate-schema.ts`

## How to Clean Up

1. Delete the files and directories listed above
2. Run the new setup script to ensure everything works:
   ```bash
   npm run db:setup
   ```

## Note

Before removing any files, make sure to:
1. Commit your current changes
2. Create a backup of your database
3. Test the new setup script to ensure it works correctly