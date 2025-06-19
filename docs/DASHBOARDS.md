# 📊 DASHBOARDS.md — FuelSync Hub Dashboards

This guide outlines the various dashboards available in the FuelSync Hub platform and what metrics or insights each user role can access.

---

## 🏢 Owner Dashboard

The owner dashboard provides a **comprehensive overview** of station performance, credit status, fuel usage, and staff activity.

### 📌 Widgets

| Widget Name            | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| **Total Sales (₹)**    | Sum of all sale amounts (cash + UPI + card + credit) for today |
| **Volume Sold (L)**    | Sum of today's `sale_volume` across all nozzles                |
| **Credit Outstanding** | `SUM(creditors.running_balance)`                               |
| **Top Creditors**      | Top 5 creditors by running balance                             |
| **Payment Breakdown**  | Chart by payment method: cash, card, UPI, credit               |
| **7-Day Trend**        | Daily sales + volume graph for the last 7 days                 |
| **Price Chart**        | Historical price changes for Petrol/Diesel                     |
| **Fuel Inventory**     | Tank-wise current inventory from `fuel_inventory`              |
| **Recon Summary**      | End-of-day reconciliation figures for today                    |

---

## 👷 Manager Dashboard

Managers see **station-level insights** only for stations they’re assigned to.

| Widget Name           | Description                                               |
| --------------------- | --------------------------------------------------------- |
| **Daily Sales**       | Same as owner, scoped to assigned station(s)              |
| **Staff Check-in**    | Recent `user_sessions` for station staff                  |
| **Nozzle Readings**   | Today’s readings per nozzle with status (entered/pending) |
| **Credit Collected**  | Payments from creditors today (`credit_payments`)         |
| **Deliveries Logged** | Fuel deliveries made today                                |

---

## ⛽ Attendant View

Attendants don’t have dashboards. Instead:

* Home screen shows quick sales entry
* Simple cards for:

  * Total volume entered today
  * Last nozzle reading per pump

---

## 🔢 Source of Truth

All dashboard values are computed from:

* `sales`
* `nozzle_readings`
* `fuel_prices`
* `creditors` + `credit_payments`
* `fuel_inventory`
* `fuel_deliveries`
* `user_sessions`

---

## 🔍 Dashboard Validation Queries (Sample)

```sql
-- Today's total sales (station X)
SELECT SUM(amount) FROM sales WHERE station_id = $station AND recorded_at::date = CURRENT_DATE;

-- Credit outstanding
SELECT SUM(running_balance) FROM creditors WHERE station_id = $station;

-- 7-day trend (volume)
SELECT DATE(recorded_at) AS day, SUM(sale_volume)
FROM sales
WHERE station_id = $station AND recorded_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY day ORDER BY day;
```

---

## ✅ Agent-Friendly Mapping

| Dashboard       | Data Source(s)                     | Verified In                   |
| --------------- | ---------------------------------- | ----------------------------- |
| Owner Dashboard | `sales`, `creditors`, `inventory`  | `BUSINESS_RULES.md`, `API.md` |
| Manager View    | `user_sessions`, `nozzle_readings` | `API.md`, `SEEDING.md`        |
| Attendant View  | `sales`, `readings`                | `API.md`                      |

---

> Dashboards reflect real-time sales, credit, and fuel data. Ensure seeds cover all roles and time spans.
