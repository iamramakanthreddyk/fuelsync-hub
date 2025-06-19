
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
- Replaced planType references with subscription_plan in DATABASE_SCHEMA.md.
- Synced PLANS.md snippet with latest PLAN_CONFIG settings.
- Seed script now includes station_id when creating creditors.

## 2025-06-22
- Added `GET /api/admin/reports/usage` and `/api/docs` to API.md.
- Linked SALES to STATIONS and USERS in ERD.
- Documented fuel_price_history table in DATABASE_GUIDE.
- Applied plan guard `checkStationLimit` in station routes.
