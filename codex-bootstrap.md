# 🚀 Welcome to FuelSync Hub — ERP for Fuel Stations

You're working inside a multi-tenant SaaS backend built in Node.js + PostgreSQL + React. The `/docs` folder contains 100% of the project architecture, API surface, DB schema, validation rules, and seed flows.

## 🔍 OBJECTIVE

Your goal is to improve, extend, or debug the project *without breaking seed logic, validation, or multi-tenant rules*.

---

## 🤖 MANDATORY AGENT SETUP

**⚠️ CRITICAL: You MUST use your own local database. DO NOT connect to external/production databases.**

### Step 1: Start Your Own Database
```bash
# Start PostgreSQL container (REQUIRED)
docker run --name fuelsync-agent-db -p 5432:5432 \
  -e POSTGRES_DB=fuelsync_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:13
```

### Step 2: Set Environment Variables (REQUIRED)
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false
export JWT_SECRET=agent-jwt-secret
export PORT=3001
export NODE_ENV=development
```

### Step 3: Install and Setup
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../backend
npm run db:setup
cd ..
npm run dev
```

**Access**: http://localhost:3000 (owner@demofuel.com / password123)

---

## 🚨 AGENT REQUIREMENTS

### Database Rules
- ✅ **MUST** use local PostgreSQL container
- ✅ **MUST** set environment variables (no .env files)
- ❌ **NEVER** connect to external/Azure/production databases
- ❌ **NEVER** rely on existing .env files

### Setup Rules
- ✅ **MUST** start your own database first
- ✅ **MUST** verify database connection before proceeding
- ✅ **MUST** use provided environment variables
- ❌ **NEVER** assume database exists
- ❌ **NEVER** skip database setup

---

## 📁 Reference Documentation

| File                | Purpose                                               |
|---------------------|-------------------------------------------------------|
| ARCHITECTURE.md     | Hierarchy of roles, data flow, station → nozzle → sale |
| BUSINESS_RULES.md   | Core validations: readings, deltas, fuel pricing, credit |
| API.md              | All REST endpoints grouped by role/module             |
| DATABASE_GUIDE.md   | DB tables, key constraints, example queries            |

---

## 🔧 Agent Commands

All commands require environment variables to be set first:

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

## ✅ Verification Checklist

Before starting work, verify:
- [ ] PostgreSQL container is running
- [ ] Environment variables are set
- [ ] Database connection works: `npm run db check`
- [ ] Application starts: `npm run dev`
- [ ] Login works: http://localhost:3000

---

## 🚨 CRITICAL WARNINGS

### DO NOT:
- Connect to external databases
- Use production credentials
- Skip database setup
- Rely on .env files
- Assume existing setup

### ALWAYS:
- Start your own database
- Set environment variables
- Verify setup before coding
- Use local development only

---

## ⚠️ IMPORTANT RULES

1. Do **not** insert into `sales.amount` — it is auto-calculated
2. Every station must belong to a tenant, and have a linked owner
3. `user_stations` defines access — always check role before action
4. If modifying pricing, validate price history logic
5. Don't hardcode IDs — use UUID and match seeded schema

---

## ✅ READY TO BEGIN

Only proceed after completing the mandatory setup above. Start by scanning:
- `API.md` for missing endpoints
- `BUSINESS_RULES.md` for undocumented edge cases
- `DATABASE_GUIDE.md` for schema understanding