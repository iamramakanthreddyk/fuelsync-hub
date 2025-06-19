# 🚀 Welcome to FuelSync Hub — ERP for Fuel Stations

You're working inside a multi-tenant SaaS backend built in Node.js + PostgreSQL + React. The `/docs` folder contains 100% of the project architecture, API surface, DB schema, validation rules, and seed flows.

## 🔍 OBJECTIVE

Your goal is to improve, extend, or debug the project *without breaking seed logic, validation, or multi-tenant rules*.

---
## 📁 Docs Structure (Ref: `/docs`)
## 🧠 Reference Docs

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
5. Don’t hardcode IDs — use UUID and match seeded schema

---

## ✅ READY TO BEGIN

Start by scanning:
- `API.md` for missing endpoints
- `BUSINESS_RULES.md` for undocumented edge cases
- `TROUBLESHOOTING.md` for fixes you can automate

Save all work to `CHANGELOG_AI.md` if you're making large changes.
