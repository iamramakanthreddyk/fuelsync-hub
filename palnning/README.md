# FuelSync Hub - Documentation Index

## Architecture
- [database-schema.puml](../../database/database-schema.puml): ER diagram of all main tables and relationships
- [data-flow-diagram.puml](../../data-flow-diagram.puml): System data flow (actors, UI, API, DB, Stripe)

## Implementation Plan
- [FuelSync Hub - Implementation Plan](./FuelSync%20Hub%20-%20Implementation%20Plan)
- [erp.md](./erp.md): Plan/feature matrix

## Database Schema
- [backend/db/schema.sql](../../backend/db/schema.sql): Consolidated database schema

## Key Flows
- Sales recording, reconciliation, and plan enforcement are described in the Implementation Plan and diagrams.

## How to Reset and Seed the Database
1. Navigate to the `backend` directory.
2. Run `npm run db:reset` to recreate the schema and seed data.

## How to Generate Diagrams
- Use PlantUML to render `.puml` files for ERD and data flow.

## Automated Documentation

- The ERP/Feature Matrix (`erp.md`) and API summary (`api-summary.md`) are auto-generated from source-of-truth config and OpenAPI spec.
- To update these docs after changing plans/features or API endpoints, run:

```sh
node scripts/generate-erp-md.js
node scripts/generate-api-docs.js
```

- All documentation is kept in sync with the codebase for accuracy and developer onboarding.

## Next Steps
- See Implementation Plan for roadmap and priorities.

## Guides
- [User Guide](./user-guide.md)
- [Developer Guide](./developer-guide.md)
- [SuperAdmin Manual](./superadmin-manual.md)

## API Documentation
- [API Spec](./api-spec.yaml)
- [API Summary](./api-summary.md)
- [Nozzle Reading & Dashboard APIs](./api-summary.md)
- [Nozzle Reading Entry](./nozzle-entry.tsx)
- [Owner/Manager Dashboard](./dashboard.tsx)
