
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
export const planConfig = {
  basic: {
    maxStations: 1,
    maxUsers: 5,
    enableCreditors: false,
    enableReports: false,
    enableApiAccess: false,
    support: 'email'
  },
  premium: {
    maxStations: 3,
    maxUsers: 20,
    enableCreditors: true,
    enableReports: true,
    enableApiAccess: false,
    support: 'priority'
  },
  enterprise: {
    maxStations: Infinity,
    maxUsers: Infinity,
    enableCreditors: true,
    enableReports: true,
    enableApiAccess: true,
    support: 'dedicated'
  }
}
📈 Plan Upgrade Flow
When a tenant hits a limit:

A warning or upgrade prompt is shown in the UI

Features are greyed out or disabled

Option to contact SuperAdmin or open an upgrade request

🧪 Plan Features Testing
SuperAdmins can override plans or manually test features using the seed script:

bash
Copy
Edit
npm run db:seed -- --plan=premium
🔐 Plan-Based Route Enforcement
APIs validate plan permissions using middleware like:

ts
Copy
Edit
if (!plan.enableCreditors) {
  return res.status(403).json({ error: "Credit feature not enabled in current plan" });
}
📚 Related Files
planConfig.ts (source of truth)

SEEDING.md (simulate plans)

ROLES.md (which roles can use features)

API.md (routes gated by plan)