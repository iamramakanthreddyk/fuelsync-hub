# 📘 PRODUCT\_STORY.md — FuelSync Hub Overview

FuelSync Hub is a cloud-native, multi-tenant ERP system purpose-built for fuel station management. It enables station owners to track daily sales, employee activity, fuel deliveries, credit operations, and more — all under one centralized platform.

---

## 🎯 Target Audience

| Role          | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| SuperAdmin    | SaaS platform operator who creates and monitors tenants      |
| Station Owner | Primary user and customer who runs one or more fuel stations |
| Manager       | Oversees daily operations, assigned by the owner             |
| Attendant     | Operates fuel pumps, logs readings, handles customers        |

---

## 🚀 High-Level Value Proposition

> "Like Shopify but for fuel stations"

Each fuel station organization (tenant) runs a self-contained system with their own users, equipment, and reports — all provisioned and monitored by a SuperAdmin.

---

## 🔐 SuperAdmin Journey

SuperAdmins are responsible for platform-level operations:

* Create tenant accounts with isolated schemas
* Assign subscription plans (Basic / Premium / Enterprise)
* Control feature access via planConfig
* Monitor activity and errors
* Seed test/demo data
* Perform migrations and documentation updates

Accessible at: `/superadmin`

---

## 🛠 Owner Workflow

Station owners can:

* Register & onboard their business
* Add/manage stations, pumps, nozzles
* Assign employees by role
* Configure fuel prices
* Track:

  * Daily readings
  * Sales (auto-generated)
  * Fuel deliveries
  * Credit customers
  * Cash/card breakdowns
* View dashboard reports and analytics

Accessible at: `/login` (redirects to owner dashboard)

---

## 🧪 Example Use Case — Nozzle Readings & Sales

1. Attendant logs a cumulative nozzle reading: 1050.0
2. System looks up last reading (e.g., 1000.0)
3. Calculates delta = 50.0 liters
4. Fetches fuel price (e.g., ₹90/L)
5. Auto-inserts sales record: 50 × 90 = ₹4500

Repeatable any number of times per day.

---

## 📈 Dashboards

**Owner Dashboard Metrics**:

* Total sales (₹)
* Volume sold (liters)
* Cash/card/UPI/credit split
* Outstanding credit
* 7-day trend graph
* Top creditors (by balance)

**Manager Dashboard**:

* Today’s readings summary
* Fuel prices
* Delivery history

**Attendant Dashboard**:

* Assigned station only
* Reading entry
* Payment mode logs

---

## 📌 Core Modules (Feature Map)

| Module                | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| Multi-Tenant ERP      | Isolated schemas per tenant                                |
| Role Management       | Superadmin, Owner, Manager, Attendant                      |
| Equipment Setup       | Stations → Pumps → Nozzles                                 |
| Nozzle Readings       | Cumulative, timestamped, validated                         |
| Sales Calculation     | Auto delta logic with fuel price snapshot                  |
| Fuel Prices           | Timestamped pricing per station/fuel\_type                 |
| Creditors & Payments  | Fuel issued on credit, balance tracking, repayment logging |
| Fuel Inventory        | Log deliveries, auto-update tank volume                    |
| Daily Reconciliations | End-of-day station-level cash + fuel closure               |
| Dashboard Reporting   | Trend lines, breakdowns, credit exposure                   |
| Plan Enforcement      | Based on plan type: limits on stations, users, features    |
| API Access            | RESTful endpoints per role (Premium+ plans only)           |
| Seeding               | Dev/staging demo data with full entity relations           |

---

## 💡 Future Enhancements

* 🔌 UPI/POS Integration
* 📦 Inventory Alerts
* 🔗 Supplier Management
* 📈 Predictive Analytics
* 💳 Stripe-based Plan Billing

---

This document is ideal for onboarding developers, marketing teams, and stakeholders to understand the business and technical vision of FuelSync Hub.
