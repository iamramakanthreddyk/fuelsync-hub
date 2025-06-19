# 🚀 Welcome to FuelSync Hub — ERP for Fuel Stations

You're working inside a multi-tenant SaaS backend built in Node.js + PostgreSQL + React.

## 🤖 AGENT QUICK START

**One command setup - everything automated:**

```bash
chmod +x agent-bootstrap.sh
./agent-bootstrap.sh
```

This script will:
- ✅ Start PostgreSQL database automatically
- ✅ Set all environment variables automatically  
- ✅ Install all dependencies
- ✅ Setup database schema and seed data
- ✅ Verify everything works

**Then start coding:**
```bash
npm run dev
```

**Access**: http://localhost:3000 (owner@demofuel.com / password123)

---

## 📁 Reference Documentation

| File                | Purpose                                               |
|---------------------|-------------------------------------------------------|
| ARCHITECTURE.md     | Hierarchy of roles, data flow, station → nozzle → sale |
| BUSINESS_RULES.md   | Core validations: readings, deltas, fuel pricing, credit |
| API.md              | All REST endpoints grouped by role/module             |
| DATABASE_GUIDE.md   | DB tables, key constraints, example queries            |

---

## 🔧 Available Commands

```bash
# Database operations
npm run db setup    # Complete setup
npm run db check    # Test connection
npm run db fix      # Fix relationships
npm run db reset    # Clean slate

# Development
npm run dev         # Start both servers
```

---

## ⚠️ IMPORTANT RULES

1. Do **not** insert into `sales.amount` — it is auto-calculated
2. Every station must belong to a tenant, and have a linked owner
3. `user_stations` defines access — always check role before action
4. If modifying pricing, validate price history logic
5. Don't hardcode IDs — use UUID and match seeded schema

---

## ✅ READY TO BEGIN

After running `./agent-bootstrap.sh`, start by scanning:
- `API.md` for missing endpoints
- `BUSINESS_RULES.md` for undocumented edge cases
- `DATABASE_GUIDE.md` for schema understanding