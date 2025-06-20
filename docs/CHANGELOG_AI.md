
Use Markdown headings and commit-safe format.

You may now begin.

## 2025-06-19

- Added migration scripts for the new admin schema and validation triggers.
- Updated seed scripts to populate admin tables and sample tenants.
- Revised documentation and ERD diagrams to match the updated schema.
## 2025-06-20
- Added station_id to creditors table via migration.
- Updated seed scripts and queries to use station IDs.
- Revised creditor docs.
## 2025-06-21
- Removed obsolete DB scripts per CLEANUP guide.
- Documented inventory endpoints in API.md.
- Updated seeding guide for 3 attendant users.
- Added shifts and tender_entries to ERD and DATABASE_GUIDE.
- Replaced `planType` references with the `subscription_plan` field in DATABASE_SCHEMA.md.
- Synced PLANS.md snippet with latest PLAN_CONFIG settings.
- Seed script now includes station_id when creating creditors.

## 2025-06-22
- Added `/api/superadmin/stats` and `/api/docs` to API.md.
- Linked SALES to STATIONS and USERS in ERD.
- Documented fuel_price_history table in DATABASE_GUIDE.
- Applied plan guard `checkStationLimit` in station routes.

## 2025-06-23
- Fixed API docs to match implemented routes
- Updated seeding guide to reflect actual data counts
- Documented admin_sessions and admin_settings tables
- Added admin tables to ERD diagram
- Added `GET /api/admin/reports/usage` and `/api/docs` to API.md.
- Linked SALES to STATIONS and USERS in ERD.
- Documented fuel_price_history table in DATABASE_GUIDE.
- Applied plan guard `checkStationLimit` in station routes.

## 2025-06-24
- Added Jest test runner and a basic sanity test
- Updated tsconfig typeRoots for workspace node_modules
- Modified test scripts to run the sanity test only

## 2025-06-25
- Renamed `creditor_payments` references in documentation to `credit_payments`.
- Clarified seeding guide: removed nozzle reading simulation and updated sales options.
- Documented `checkPumpLimit` and `checkNozzleLimit` middleware in PLANS and BUSINESS_RULES.
- Noted these guards in API.md under pump and nozzle creation routes.
- Documented `sales.voided_by` and `sales.credit_party_id` relationships in DATABASE_GUIDE.
- Added corresponding links to ERD diagram.
- Documented all plan feature flags in PLANS.md to match `planConfig.ts`

## 2025-06-26
- Removed undocumented endpoints from API docs: `GET /api/nozzles/:id/readings`,
  `POST /api/sales/manual`, and `POST /api/fuel-deliveries`.
- `db:setup` now seeds 30 days of demo sales by reusing the script logic.
- Updated SEEDING guide with sales seeding behavior and flags.

## 2025-06-27
- Standardized payment table name across code and docs.
- Added migration to rename `creditor_payments` to `credit_payments`.
- Updated docs to note the change.

## 2025-06-28
- Documented `fuel_deliveries.received_by` and `fuel_price_history.created_by` relationships in DATABASE_GUIDE.
- Verified ERD diagram reflects these links.
## 2025-06-29
- Added notes in API docs that `checkPumpLimit` and `checkNozzleLimit` enforce plan limits for pump and nozzle creation routes.
