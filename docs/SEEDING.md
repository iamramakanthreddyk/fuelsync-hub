SEEDING.md — Populating FuelSync Hub with Demo/Test Data
This guide explains how to seed the database with sample data for development, testing, or onboarding.

🧪 Full Reseed
Run this to drop all schemas and re-initialize the system:

bash
Copy
Edit
npm run db:reset
Internally executes:

Drops public and tenant schemas

Applies all migrations

Seeds SuperAdmin and tenants with default data
Generates 30 days of sample sales for each station

🛠 Manual Seed Script
For finer control, run:

bash
Copy
Edit
npx ts-node db/scripts/seed.ts
Options:

bash
Copy
Edit
--tenant=test_tenant      # Reseeds only one tenant
--plan=premium            # Use specific plan type
--sales=50                # Number of sample sales to generate
--skip-sales              # Do not create any sales records
--demo=true               # Loads dummy creditors & payments

`npm run db:setup` always generates 30 days of sales. Use the options above with
`db/scripts/seed.ts` to change the count or skip creating sales entirely.
👤 Seeded Roles & Data
SuperAdmin
Email: admin@fuelsync.com

Password: admin123

Tenants
Each tenant has:

1 Owner (role = owner)

1 Station

1 Pump → 2 Nozzles

3 Users (owner, manager, attendant)

No creditors by default

Fuel Prices per nozzle

🔐 Plan Simulation
Seeding auto-selects plan type:

Plan	Max Stations	Max Users
basic	1	5
premium	3	15
enterprise	∞	∞

To override:

bash
Copy
Edit
npx ts-node db/scripts/seed.ts --plan=enterprise
🧾 Helpful Scripts
Task	Script
Full clean/reset	npm run db:reset
Migrate only	npm run db:migrate
Reseed specific tenant	seed.ts --tenant=xyz
Clean only	psql < clean_db.sql