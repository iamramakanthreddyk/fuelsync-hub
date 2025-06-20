# 🤖 Agent Automation Guide (AGENT_AI.md)

This file explains how any future AI agent or Codex instance should automate the FuelSync Hub project. Follow these guidelines to ensure a consistent environment and workflow.

## 1. DO NOT USE DOCKER
- Skip Docker completely. Use your own local PostgreSQL instance.
- Export these environment variables before running any setup commands:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false
```

## 2. Install Strategy

```bash
cd backend && npm install --legacy-peer-deps
cd ../frontend && npm install --legacy-peer-deps
```

If installation fails, install pnpm and retry:

```bash
npm install -g pnpm
pnpm install
```

## 3. Database Setup (Local PostgreSQL)

```bash
psql -U postgres -c "CREATE DATABASE fuelsync_dev;"
npm run db:setup
npm run db:check
```

## 4. Start Application

```bash
cd backend && npm run dev &
cd frontend && npm run dev &
```

## 5. Test APIs Using curl

Use the following curl examples. Replace `<TOKEN>` with the JWT from the login step.

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@demofuel.com", "password": "demo123"}'

# Example create station
curl -X POST http://localhost:3001/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"station_name": "Main Station"}'

# Example create pump
curl -X POST http://localhost:3001/api/pumps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"station_id": 1, "pump_name": "Pump 1"}'

# Example create nozzle
curl -X POST http://localhost:3001/api/nozzles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"pump_id": 1, "fuel_type_id": 1, "nozzle_name": "Nozzle 1"}'

# Example create sale
curl -X POST http://localhost:3001/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"nozzle_id": 1, "litres": 10, "price_per_litre": 3.50}'

# Example void sale
curl -X PUT http://localhost:3001/api/sales/1/void \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"void_reason": "cancellation"}'

# Delete pump
curl -X DELETE http://localhost:3001/api/pumps/1 \
  -H "Authorization: Bearer <TOKEN>"

# Delete nozzle
curl -X DELETE http://localhost:3001/api/nozzles/1 \
  -H "Authorization: Bearer <TOKEN>"
```

## 6. Fix Strategy Loop
- If any curl request fails, inspect the database and server logs.
- Patch the schema via a new migration, regenerate docs, and re-run tests.
- Update `DATABASE_SCHEMA.md` and add migrations under `backend/db/migrations/`.
- Re-validate the failing endpoint with curl after applying the fix.

## 📘 Purpose

This guide ensures that future Codex agents skip Docker, use a local PostgreSQL setup, and follow a clear test → fix → validate loop when working with the FuelSync Hub project.
