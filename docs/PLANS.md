
# 🧾 FuelSync Hub Plans & Feature Limits

FuelSync Hub uses a **plan-based system** to control access to features and limits on resources per tenant.

---

## 📦 Available Plans

| Plan       | Monthly (₹) | Stations | Users | Creditors | Reports | API Access | Support   |
|------------|-------------|----------|-------|-----------|---------|------------|-----------|
| Basic      | ₹999        | 1        | 5     | No        | No      | No         | Email     |
| Premium    | ₹1999       | 3        | 20    | Yes       | Yes     | No         | Priority  |
| Enterprise | ₹4999+      | ∞        | ∞     | Yes       | Yes     | Yes        | Dedicated |

> All plans are billed in INR (₹). Yearly discounts and custom plans available on request.

---

## 🛠️ How Plan Limits Work

Limits are enforced in:

- **Station Creation**
- **User Assignments**
- **Access to Creditors, Reports, or Analytics**
- **Feature toggles in UI and API routes**

Plan limits are controlled by `planConfig.ts`:

```ts
export const PLAN_CONFIG = {
  basic: {
    maxStations: 1,
    maxPumpsPerStation: 4,
    maxNozzlesPerPump: 4,
    maxUsers: 5,
    exportData: false,
    advancedReports: false,
    apiAccess: false,
    manageStations: true,
    managePumps: true,
    manageNozzles: true,
    managePrices: true,
    manageUsers: false,
    recordSales: true,
    reconcile: true,
    viewReports: true,
  },
  premium: {
    maxStations: 5,
    maxPumpsPerStation: 8,
    maxNozzlesPerPump: 6,
    maxUsers: 20,
    exportData: true,
    advancedReports: true,
    apiAccess: false,
    manageStations: true,
    managePumps: true,
    manageNozzles: true,
    managePrices: true,
    manageUsers: true,
    recordSales: true,
    reconcile: true,
    viewReports: true,
  },
  enterprise: {
    maxStations: 999,
    maxPumpsPerStation: 999,
    maxNozzlesPerPump: 999,
    maxUsers: 999,
    exportData: true,
    advancedReports: true,
    apiAccess: true,
    manageStations: true,
    managePumps: true,
    manageNozzles: true,
    managePrices: true,
    manageUsers: true,
    recordSales: true,
    reconcile: true,
    viewReports: true,
  }
}
```
📚 Related Files
planConfig.ts (source of truth)

SEEDING.md (simulate plans)

ROLES.md (which roles can use features)

API.md (routes gated by plan)