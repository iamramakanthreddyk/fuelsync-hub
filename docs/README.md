# 🛠 FuelSync Hub — Developer Docs

This repo powers the ERP backend for Fuel Station SaaS.

## 📚 Docs Index

| Doc Name             | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `ARCHITECTURE.md`    | System structure, users, features                             |
| `PRODUCT_STORY.md`   | Explainer version for onboarding/devs                         |
| `PLANS.md`           | Pricing, limits, and feature flags                            |
| `ROLES.md`           | Access control matrix for users                               |
| `SEEDING.md`         | How to populate DB with test/demo data                        |
| `AUTH.md`            | Login, sessions, auth middleware                              |
| `API.md`             | REST API breakdown by feature + role                          |
| `DATABASE_GUIDE.md`  | DB structure, ERD, and responsibilities                       |
| `TROUBLESHOOTING.md` | Migrations, seed bugs, test issues                            |
| `BUSINESS_RULES.md`  | Calculation logic, credit rules, plan enforcement, validation |

## 🧪 Dev Setup

```bash
git clone <your-repo-url>
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Visit:

* Swagger Docs: [http://localhost:3001/docs](http://localhost:3001/docs)
* SuperAdmin Dashboard: [http://localhost:3001/superadmin](http://localhost:3001/superadmin)
