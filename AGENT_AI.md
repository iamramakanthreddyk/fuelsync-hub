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
npm install --legacy-peer-deps
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

## Front-End Recon
- Pages and components structure (`tree -L 2 frontend/src`):
```
frontend/src
├── components
│   ├── PumpIcon.tsx
│   ├── admin
│   ├── auth
│   ├── common
│   ├── dashboard
│   ├── forms
│   ├── layout
│   ├── reports
│   ├── sales
│   └── stations
├── context
│   └── AuthProvider.tsx
├── pages
│   ├── _app.tsx
│   ├── admin
│   ├── api
│   ├── dashboard
│   ├── debug.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── logout.tsx
│   ├── nozzle-entry.tsx
│   ├── reconciliations
│   ├── register.tsx
│   ├── reports
│   ├── sales
│   ├── settings
│   └── stations
└── utils
```
- Major routes: `/login`, `/dashboard`, `/stations`, `/sales`, `/reports`, `/settings`, plus admin paths.
- Missing dedicated pages for pumps and nozzles.
- `npm run dev` shows warnings about unknown env config `http-proxy` but the server still starts.

## Front-End Strategy
A full refactor is recommended. The code mixes MUI and Ant Design and lacks pump/nozzle screens. Plan:
1. Centralise auth in context with token stored in localStorage and loaded on app start.
2. Use React Query for API calls with the existing backend contract.
3. Add toast notifications via `react-hot-toast`.
4. Create unified pages for Stations, Pumps, Nozzles and Sales with clean routes.
5. Adopt MUI across all components.

## Front-End Automation
```
cd frontend && npm install --legacy-peer-deps
VITE_API_BASE=http://localhost:3001
npm run dev
npm test
npm run cypress
```
If `npm` fails due to dependency issues, install pnpm and retry with `pnpm install && pnpm run dev`.
When Cypress fails due to missing Xvfb, perform manual browser testing and log results.

### Routes Added
- `/stations/[id]/pumps`
- `/stations/[id]/pumps/new`
- `/stations/[id]/pumps/[pumpId]/edit`
- `/stations/[id]/pumps/[pumpId]/nozzles`
- `/stations/[id]/pumps/[pumpId]/nozzles/new`
- `/stations/[id]/pumps/[pumpId]/nozzles/[nozzleId]/edit`
Run Cypress tests from `cypress/e2e`. Use the fix-test loop until all tests pass.
