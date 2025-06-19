Authentication & Authorization in FuelSync Hub
This guide explains how login, session handling, and role-based access control work across tenants.

🧑‍💼 SuperAdmin Authentication
SuperAdmins exist in the public.admin_users table.

Login via /superadmin page

Validated using encrypted password hash

Session stored in admin-only session store or JWT

🏢 Tenant User Authentication
Tenant users (owners, managers, attendants):

Exist in per-tenant users table (e.g., acme.users)

Log in via /login

Auth flow:

plaintext
Copy
Edit
[login] → validate email/password → get tenant schema → issue tenant-scoped session
✅ Session Tracking
Each login is recorded in user_sessions:

sql
Copy
Edit
user_id → login_time → logout_time → ip/device info
🧾 Role-Based Access Control
Role field stored in user_stations:

ts
Copy
Edit
{
  user_id: UUID,
  station_id: UUID,
  role: 'owner' | 'manager' | 'attendant'
}
Middleware enforces role-level access:

Owners → full tenant control

Managers → partial station ops

Attendants → restricted to sales entry

🛡 Auth Middleware Samples
ts
Copy
Edit
checkAuth(req, res, next) // general JWT validation
checkRole('owner')        // ensures only owners can access
checkStationAccess(user_id, station_id) // ensures binding
🔒 Technical Notes
Passwords hashed using bcrypt

Sessions stored as JWTs (or optional Redis session store)

SuperAdmins and Tenant Users are fully separated

Cross-tenant access is not allowed

Always use getUserFromToken() before trusting any frontend identity.

📘 README.md (Final Entry Point)
We'll update this to reflect all doc links, setup instructions, and developer orientation. Here's the final content block to add to the repo root README:

md
Copy
Edit
# 🛠 FuelSync Hub — Developer Docs

This repo powers the ERP backend for Fuel Station SaaS.

## 📚 Docs Index

| Doc Name         | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `ARCHITECTURE.md`| System structure, users, features               |
| `PRODUCT_STORY.md`| Explainer version for onboarding/devs         |
| `PLANS.md`       | Pricing, limits, and feature flags              |
| `ROLES.md`       | Access control matrix for users                 |
| `SEEDING.md`     | How to populate DB with test/demo data          |
| `AUTH.md`        | Login, sessions, auth middleware                 |
| `API.md`         | REST API breakdown by feature + role            |
| `DATABASE_GUIDE.md` | DB structure, ERD, and responsibilities     |
| `TROUBLESHOOTING.md`| Migrations, seed bugs, test issues           |

## 🧪 Dev Setup

```bash
git clone ...
npm install
npm run db:migrate
npm run db:seed
npm run dev
Visit:

Swagger Docs: http://localhost:3001/docs

SuperAdmin: http://localhost:3001/superadmin