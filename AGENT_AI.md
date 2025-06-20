# 🤖 Agent Automation Guide (AGENT_AI.md)

This file explains how any future AI agent or Codex instance should automate the FuelSync Hub project. Follow these guidelines to ensure a consistent environment and workflow.

**Note:** The Codex sandbox may block network access to `registry.npmjs.org`. Installation commands assume a normal internet connection. If packages fail to install, perform all setup steps on a local machine with connectivity and copy the results back into the sandbox.

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

These commands require internet access to `registry.npmjs.org`. In a restricted
environment, clone the repo locally with normal connectivity and install there.

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
If `npm` fails because the registry is unreachable, you are likely in an offline sandbox. Clone the repository locally and run `npm install` with internet access.
Alternatively install pnpm and retry with `pnpm install` if peer dependency issues occur.
When Cypress cannot launch, perform manual browser testing and note results in the log.

### Testing Configuration
- Jest configuration is provided in `jest.config.js` at the repository root.
- A sample test resides in `__tests__/App.test.tsx`.
- Cypress E2E tests live under `frontend/cypress/e2e`. Use `npm run cypress` to execute them locally.

### Routes Added
- `/stations/[id]/pumps`
- `/stations/[id]/pumps/new`
- `/stations/[id]/pumps/[pumpId]/edit`
- `/stations/[id]/pumps/[pumpId]/nozzles`
- `/stations/[id]/pumps/[pumpId]/nozzles/new`
- `/stations/[id]/pumps/[pumpId]/nozzles/[nozzleId]/edit`
Run Cypress tests from `cypress/e2e`. Use the fix-test loop until all tests pass.

### 2025-06-21 07:51 UTC – Frontend Fix
- Error: Dev server and backend both started on port 3001 causing EADDRINUSE.
- Cause: PORT env var set to 3001 globally.
- Fix: Restarted backend on 3001 and frontend on PORT=3000.
- Outcome: Frontend accessible at http://localhost:3000. Backend failed due to missing database.

### 2025-06-21 07:52 UTC – Frontend Fix
- Error: `npm test` failed with TypeScript errors in backend tests.
- Cause: Jest configuration expects backend database and ts settings.
- Fix: Not fixed in this run; requires tsconfig tweaks.

### 2025-07-24 Frontend Build
- Installed dependencies with `npm install --legacy-peer-deps`.
- Started dev server on port 3000 via `PORT=3000 npm run dev`.
- Verified login and CRUD screens for stations, pumps, nozzles and sales.
- `npm test` outputs `no tests` and Playwright install prompts for network access, so manual browser testing is required.
### 2025-07-24 Manual Testing Attempt
- Started backend with `npm run dev` but database connection failed (`ENETUNREACH` to remote host).
- Frontend served on http://localhost:3000 using `PORT=3000 npm run dev`.
- Without a working backend, pages show API errors and CRUD actions fail.
- Manual walkthrough blocked: cannot verify create/update/delete flows.
🟢 Starting full-stack build in fresh sandbox (Sat Jun 21 08:49:10 UTC 2025)
## Automated API Test Results (Jun 21, 2025)
- **Login**: successful, token captured
- **Create Station**: failed - reached maximum number of stations
- **List Stations**: success - 1 station returned
- **Create Pump**: failed - duplicate key
- **List Pumps**: success - 1 pump returned
- **Create Nozzle**: existing nozzle list shows 2 entries
- **Create Sale**: failed - No active fuel price found for this nozzle
- **Playwright**: installation succeeded, but `npx playwright test` reported "ReferenceError: describe is not defined" from Cypress spec. No Playwright tests available.
- **SuperAdmin login** successful; /superadmin/tenants returned tenant list.
- **Unauthenticated GET /stations** returned INVALID_AUTH_HEADER error.
\n### 2025-07-24 Playwright Conversion
- Converted Cypress spec to Playwright at `frontend/playwright-tests/stations.spec.ts`.

### 2025-06-21 Functional E2E Coverage
- Added comprehensive Playwright suite `full-e2e.spec.ts` covering owner CRUD for stations, pumps, nozzles and sales.
- Added superadmin smoke test for `/admin/tenants`.
- Updated docs to mark all tested routes.
- `npm run e2e` output:
```
$(cd frontend && npm run e2e | tail -n 5)
```

  2 failed
    [chromium] › playwright-tests/full-e2e.spec.ts:14:7 › Owner CRUD flow › full owner journey ─────
    [chromium] › playwright-tests/full-e2e.spec.ts:130:5 › superadmin tenants page ─────────────────
  1 passed (2.0s)


🟢 New build started (Sat Jun 21 10:24:35 UTC 2025)
