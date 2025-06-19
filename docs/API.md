# 📘 API.md — FuelSync Hub API Summary

This document outlines the available API endpoints grouped by user roles in the FuelSync Hub platform.

---

## 🔐 SuperAdmin API Endpoints

> For managing tenants, users, plans, and platform-level operations

### 🏢 Tenant Management

* `GET /api/superadmin/tenants` — List all tenants
* `POST /api/superadmin/tenants` — Create a new tenant
* `GET /api/superadmin/tenants/:id` — Get tenant details
* `PATCH /api/superadmin/tenants/:id` — Update tenant metadata
* `DELETE /api/superadmin/tenants/:id` — Archive or delete a tenant

### 👤 Tenant User Access

* `GET /api/superadmin/tenants/:tenantId/users` — List all users under a tenant (owner, manager, attendant)
* `GET /api/superadmin/tenants/:tenantId/users/:userId` — Get specific user
* `DELETE /api/superadmin/tenants/:tenantId/users/:userId` — Delete or deactivate user
* `POST /api/superadmin/tenants/:tenantId/users/:userId/reset-password` — Reset a user's password

### 📦 Plan & Billing

* `GET /api/superadmin/plans` — List available plans
* `POST /api/superadmin/plans` — Create a new plan
* `PATCH /api/superadmin/plans/:id` — Update plan limits/features
* `DELETE /api/superadmin/plans/:id` — Disable a plan

### 🧪 Seeding & Testing

* `POST /api/superadmin/seed` — Seed a tenant with test data
* `POST /api/superadmin/reset` — Wipe and reseed dev tenant

### 📝 Platform Logs

* `GET /api/superadmin/activity-logs` — Admin activity log viewer
* `GET /api/superadmin/errors` — System error viewer

---

## 🏢 Tenant Owner API Endpoints

> For managing their fuel business

### 🛠 Setup

* `POST /api/stations` — Create a station
* `POST /api/pumps` — Add a pump to a station
* `POST /api/nozzles` — Add a nozzle to a pump
* `POST /api/users` — Create a new employee (manager/attendant)
* `PATCH /api/users/:id` — Update employee
* `DELETE /api/users/:id` — Deactivate employee

### ⛽ Operations

* `POST /api/nozzle-readings` — Submit cumulative reading
* `GET /api/nozzles/:id/readings` — Get historical readings
* `POST /api/sales/manual` — Add manual sale
* `GET /api/sales?stationId=...` — Get sales list
* `POST /api/fuel-prices` — Add/update fuel price
* `POST /api/fuel-deliveries` — Log fuel stock delivery

### 💳 Credit

* `POST /api/creditors` — Add credit customer
* `GET /api/creditors/:id` — View credit customer
* `POST /api/creditors/:id/payments` — Log a payment

### 📈 Dashboards

* `GET /api/dashboard/station` — Owner dashboard data
* `GET /api/reconciliations` — Daily closeout reports

---

## 🧑‍🔧 Manager API Endpoints

> Assigned to 1+ stations by owner

* `GET /api/stations/assigned` — See my stations
* `POST /api/nozzle-readings` — Enter readings
* `POST /api/sales/manual` — Add manual sale
* `POST /api/fuel-deliveries` — Record delivery
* `GET /api/dashboard/station` — Manager-level dashboard
* `GET /api/employees` — List attendants at station

---

## ⛽ Attendant API Endpoints

> Limited to daily operation tasks only

* `POST /api/nozzle-readings` — Submit daily reading
* `POST /api/sales/manual` — Add sale from reading
* `GET /api/my-station/readings` — View my reading history
* `GET /api/my-sales` — My sales summary

---

> Most endpoints are role-protected and scoped to tenant context unless explicitly marked as SuperAdmin endpoints.

➡ To test endpoints locally, use `http://localhost:3001/api/...`
