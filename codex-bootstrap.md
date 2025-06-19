# 🚀 Welcome to FuelSync Hub — ERP for Fuel Stations

You're working inside a multi-tenant SaaS backend built in Node.js + PostgreSQL + React. The `/docs` folder contains 100% of the project architecture, API surface, DB schema, validation rules, and seed flows.

## 🔍 OBJECTIVE

Your goal is to improve, extend, or debug the project *without breaking seed logic, validation, or multi-tenant rules*.

---

## 🤖 AGENT SETUP (Start Here)

**No .env files needed - Use environment variables directly:**

```bash
# 1. Start local database
docker run --name fuelsync-db -p 5432:5432 \
  -e POSTGRES_DB=fuelsync_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:13

# 2. Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false
export JWT_SECRET=agent-jwt-secret

# 3. Setup and run
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
cd backend && npm run db:setup && cd ..
npm run dev
```

**Access**: http://localhost:3000 (owner@demofuel.com / password123)

---

## 📁 Docs Structure (Ref: `/docs`)

| File                | Purpose                                               |
|---------------------|-------------------------------------------------------|
| ARCHITECTURE.md     | Hierarchy of roles, data flow, station → nozzle → sale |
| BUSINESS_RULES.md   | Core validations: readings, deltas, fuel pricing, credit |
| PLANS.md            | Plan limits: maxStations, maxEmployees, feature flags |
| API.md              | All REST endpoints grouped by role/module             |
| SEEDING.md          | Seed flow: superadmin → tenant → users → sales        |
| DATABASE_GUIDE.md   | DB tables, key constraints, example queries            |
| TROUBLESHOOTING.md  | Known issues: seed fails, FK errors, plan bugs        |
| AUTH.md             | JWT structure, role-based guards                      |
| ROLES.md            | Role logic & `user_stations` relationship             |

> Start your reasoning from `BUSINESS_RULES.md` for any core logic.  
> Refer to `SEEDING.md` to safely test changes and run `npm run db:reset`.

---

## ✅ ALLOWED TASKS

- Add API routes (must match REST pattern and be role-protected)
- Edit migrations (must be safe and included in schema docs)
- Add plan or role guards (must use middleware)
- Update seed data (must preserve logic described in SEEDING.md)
- Suggest ERD improvements (see ERD.md or mermaid blocks)

---

## ⚠️ IMPORTANT RULES

1. Do **not** insert into `sales.amount` — it is auto-calculated
2. Every station must belong to a tenant, and have a linked owner
3. `user_stations` defines access — always check role before action
4. If modifying pricing, validate price history logic (see fuel-pricing.md)
5. Don't hardcode IDs — use UUID and match seeded schema

---

## 🔧 Agent Commands

All commands use environment variables (no .env files):

```bash
# Database
npm run db setup    # Complete setup
npm run db check    # Test connection
npm run db fix      # Fix relationships
npm run db reset    # Clean slate

# Development  
npm run dev         # Start both servers
```

---

## 🚨 Testing Strategy

**Use local database only:**

```bash
# Test database (port 5433 to avoid conflicts)
docker run --name fuelsync-test -p 5433:5432 \
  -e POSTGRES_DB=fuelsync_test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:13

# Set test environment
export DB_PORT=5433 DB_NAME=fuelsync_test

# Run tests
npm run db:setup && npm test
```

**Do not connect to production Azure database!**

---

## ✅ READY TO BEGIN

Start by scanning:
- `API.md` for missing endpoints
- `BUSINESS_RULES.md` for undocumented edge cases
- `TROUBLESHOOTING.md` for fixes you can automate

Save all work to `CHANGELOG_AI.md` if you're making large changes.