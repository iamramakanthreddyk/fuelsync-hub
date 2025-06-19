## FuelSync Hub — Platform Architecture

### 🧱 System Structure

```text
SuperAdmin (Platform Operator)
  └── Tenants (Fuel Companies)
        └── Stations
              └── Pumps
                    └── Nozzles
                          └── Nozzle Readings → Sales
              └── Users (Owner, Manager, Attendant)
              └── Creditors
              └── Deliveries
```

---

### 🧩 Core Modules

| Module                 | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| Multi-Tenant Support   | Public schema + tenant schemas with isolated data           |
| User Management        | SuperAdmin & tenant user creation, role assignment          |
| Station Configuration  | Add/edit stations, pumps, nozzles                           |
| Nozzle Readings        | Cumulative manual readings, supports multiple daily entries |
| Auto Sales Calculation | Delta-based sale entry based on readings × price            |
| Fuel Pricing           | Price per station per fuel type; timestamped                |
| Credit Management      | Issue fuel on credit, track balances, take payments         |
| Fuel Inventory         | Log deliveries and tank stock                               |
| Daily Reconciliation   | Day-close summaries for sales, cash, credit, UPI, card      |
| Dashboards             | Role-based overviews for SuperAdmin, Owner, Manager         |
| Seeding & Testing      | Dev/test reset & validation support                         |

---

### 🔐 Role Access Matrix

| Role       | Access Level                                                         |
| ---------- | -------------------------------------------------------------------- |
| SuperAdmin | Global access to all tenants, plans, logs, seeds                     |
| Owner      | Access to own org, full station config, staff, sales, reports        |
| Manager    | Can view station, manage attendants, enter readings, view dashboards |
| Attendant  | Can enter readings & payment info, limited to assigned station only  |

---

### 🧠 Nozzle Reading to Sales

1. Each reading is cumulative
2. A delta is calculated with the last reading
3. That delta is used to create a sales record with price lookup

```sql
volume = new_reading - previous_reading
sale_amount = volume × current_price
```

Sales are logged automatically for every delta.

---

### 🔌 Public vs Tenant Schema

* `public` → `tenants`, `plans`, `admin_users`, `admin_logs`
* `tenant.schema` → `users`, `stations`, `sales`, `nozzles`, etc.

---

### 🧾 Key Tables

* `tenants` (public)
* `admin_users`, `admin_activity_logs`
* `users`, `user_stations`, `stations`, `pumps`, `nozzles`
* `sales`, `nozzle_readings`, `fuel_prices`, `creditors`, `credit_payments`
* `fuel_deliveries`, `fuel_inventory`, `day_reconciliations`

---

### 🧰 CLI / Dev Tools

```bash
npm run db:seed        # Populate test data
npm run db:validate    # Run schema consistency checks
node scripts/generate-api-docs.js
```

---

### 🧠 Notes

* Data design is relational with enforced FK constraints
* Plans limit usage via `planConfig.ts`
* Future UPI/POS integration possible via payment metadata mapping

---

➡ Continue in `PRODUCT_STORY.md` for the onboarding journey.
