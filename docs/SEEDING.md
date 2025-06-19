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
--includeSales=true       # Add sales & readings (default: true)
--demo=true               # Loads dummy creditors & payments
👤 Seeded Roles & Data
SuperAdmin
Email: admin@fuelsync.com

Password: admin123

Tenants
Each tenant has:

1 Owner (role = owner)

1 Station

2 Pumps → 2 Nozzles per pump

3 Users (1 manager, 2 attendants)

2 Creditors

Fuel Prices per nozzle

⛽ Sample Reading-to-Sale Flow
The script also simulates:

plaintext
Copy
Edit
Day 1: nozzle_reading = 1000.0
Day 1: later → 1050.0 → delta = 50 → sale record
Day 2: → 1100.0 → delta = 50 → sale record
Auto-calculates fuel price, volume, and amount.

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