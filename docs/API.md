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
* `POST /api/pumps` — Add a pump to a station _(checkPumpLimit enforces plan limit)
* `GET /api/pumps/:id` — Get pump details
* `PATCH /api/pumps/:id` — Update pump
* `DELETE /api/pumps/:id` — Remove pump
* `GET /api/pumps/station/:stationId` — Pumps for a station
* `POST /api/nozzles` — Add a nozzle to a pump _(checkNozzleLimit enforces plan limit)
* `GET /api/nozzles/:id` — Get nozzle details
* `PATCH /api/nozzles/:id` — Update nozzle
* `GET /api/nozzles/pump/:pumpId` — Nozzles for a pump
* `GET /api/nozzles/station/:stationId` — Nozzles for a station
* `POST /api/users` — Create a new employee (manager/attendant)
* `PATCH /api/users/:id` — Update employee
* `DELETE /api/users/:id` — Deactivate employee

### ⛽ Operations

* `POST /api/nozzles/:id/readings` — Submit cumulative reading
* `GET /api/stations/:stationId/nozzle-readings/previous` — Previous day's readings
* `GET /api/stations/:stationId/fuel-prices` — Current prices for station nozzles
* `POST /api/stations/:stationId/nozzle-readings` — Submit today's readings
* `GET /api/sales?stationId=...` — Get sales list
* `POST /api/fuel-prices` — Add/update fuel price

### 💳 Credit

* `POST /api/creditors` — Add credit customer
* `GET /api/creditors/:id` — View credit customer
* `POST /api/creditors/:id/payments` — Log a payment

### 📈 Dashboards

* `GET /api/dashboard` — Owner dashboard data
* `GET /api/reconciliations` — Daily closeout reports

---

## 🧑‍🔧 Manager API Endpoints

> Assigned to 1+ stations by owner

* `POST /api/nozzles/:id/readings` — Enter readings
* `GET /api/dashboard` — Manager-level dashboard
* `GET /api/employees` — List attendants at station

---

## ⛽ Attendant API Endpoints

> Limited to daily operation tasks only

* `POST /api/nozzles/:id/readings` — Submit daily reading

---
## 🧾 Tender & Shift Routes

* `POST /api/tender/shifts` — Open a new shift _(attendant/manager)_
* `POST /api/tender/shifts/:id/close` — Close my shift _(attendant/manager)_
* `GET /api/tender/shifts/active` — Current user's open shift _(all roles)_
* `GET /api/tender/shifts/:id` — View shift by ID _(owner/manager)_
* `GET /api/tender/shifts` — List shifts with filters _(owner/manager)_
* `POST /api/tender/tender-entries` — Record tender entry _(attendant/manager)_
* `GET /api/tender/shifts/:shiftId/tender-entries` — Entries for a shift _(owner/manager)_
* `GET /api/tender/shifts/:shiftId/summary` — Shift totals _(owner/manager)_

## 💲 Fuel Price Endpoints

* `POST /api/fuel-prices` — Create fuel price _(owner)_
* `GET /api/fuel-prices/current` — Current prices for a station _(owner/manager/attendant)_
* `GET /api/fuel-prices/history` — Price history _(owner/manager)_
* `GET /api/fuel-prices/:id` — Fuel price by ID _(owner/manager)_
* `GET /api/fuel-prices/at-date` — Price at a specific date _(owner/manager)_

## 👥 User-Station Assignment

* `POST /api/stations/assignments` — Assign user to station _(owner)_
* `DELETE /api/stations/users/:userId/stations/:stationId` — Remove from station _(owner)_
* `PATCH /api/stations/users/:userId/stations/:stationId/role` — Update station role _(owner)_
* `GET /api/stations/:stationId/users` — Users for a station _(owner/manager)_
* `GET /api/stations/users/:userId/assignments` — Stations for a user _(owner)_

## 📊 Analytics & Plan Management

* `GET /api/analytics/tenant` — Sales analytics for tenant _(owner/manager)_
* `GET /api/analytics/global` — Platform analytics _(superadmin)_
* `GET /api/plans` — List all plans _(superadmin)_
* `GET /api/plans/:tenantId` — View tenant plan _(superadmin)_
* `PUT /api/plans/:tenantId` — Set custom plan _(superadmin)_
* `DELETE /api/plans/:tenantId` — Remove custom plan _(superadmin)_

## 🔑 Admin Auth & Settings

* `POST /api/admin-auth/login` — Admin login
* `POST /api/admin-auth/logout` — End admin session _(requires token)_
* `GET /api/admin-auth/me` — Current admin info
* `POST /api/direct-admin-auth/login` — CLI login
* `GET /api/admin/settings` — View platform settings _(superadmin)_
* `PUT /api/admin/settings` — Update platform settings _(superadmin)_
* `GET /api/superadmin/stats` — Platform stats _(superadmin)_
* `GET /api/admin/reports/usage` — Platform usage reports _(superadmin)_
* `GET /api/docs` — Swagger UI

> Most endpoints are role-protected and scoped to tenant context unless explicitly marked as SuperAdmin endpoints.

➡ To test endpoints locally, use `http://localhost:3001/api/...`
