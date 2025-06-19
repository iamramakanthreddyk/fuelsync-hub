# 🧰 TROUBLESHOOTING.md — Known Issues & Fix Strategies

This file captures common bugs, data pitfalls, and developer workflows when working with FuelSync Hub.

---

## ❌ Known Issues & Root Causes

| Issue                                  | Root Cause / Fix                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `null value in column "tenant_id"`     | Station created without linking to an owner/tenant → ensure owner → station creation flow is followed |
| `sales.amount` insert crash            | `amount` is auto-calculated via reading delta and price → never manually insert this field            |
| `stations.map` crash on frontend       | Empty or `null` stations on login → always ensure seed assigns at least one station per owner         |
| Missing foreign key: `credit_party_id` | Ensure all FKs in sales → creditors are defined in schema and migration                               |
| Plan enforcement not working           | `planConfig.ts` mismatch or middleware not checking → validate plan guards per route                  |

---

## 🧪 Developer Workflow

### Migrate DB

```bash
npm run db:migrate
```

### Seed Sample Data

```bash
npm run db:seed
```

To reseed fully:

```bash
npm run db:reset
```

### Validate Schema Post-Seed

```sql
-- Check orphaned stations (no owner)
SELECT id, name FROM stations WHERE id NOT IN (SELECT station_id FROM user_stations WHERE role = 'owner');

-- Check invalid nozzle readings
SELECT * FROM nozzles WHERE current_reading < initial_reading;

-- Check delta errors
SELECT * FROM sales WHERE amount != sale_volume * fuel_price;
```

### Run Tests

```bash
npm run test
```

---

## 🧠 Troubleshooting Codex + AI Agents

### When a bug is introduced:

* Reference the impacted document (AUTH.md, SEEDING.md, DATABASE\_GUIDE.md)
* Request the fix in small units (migrations + seed updates + validation)
* Always rerun: `npm run db:reset` and `npm test`

### Best Practice:

> All CRUD APIs and data flows should be traceable to:
> `BUSINESS_RULES.md` + `ROLES.md` + `DATABASE_GUIDE.md`

---

## 🧾 Audit Coverage

* [x] Sales amount calculation logic → `BUSINESS_RULES.md`
* [x] Plan limits & middleware → `PLANS.md` + code
* [x] Creditors + payments → `creditors.md`
* [x] Reading logic → `BUSINESS_RULES.md`
* [x] Seeding flow coverage → `SEEDING.md`
* [x] DB schema links → `DATABASE_GUIDE.md`

This ensures all documented modules are covered in test+seed+plan enforcement flows.

---

> ✅ Keep this doc referenced in `README.md` for all contributors.
