# FuelSync Hub - SuperAdmin Operations Manual

## Overview
This guide is for SuperAdmins responsible for maintaining, monitoring, and scaling the FuelSync Hub SaaS platform.

---

## Core Responsibilities
- **Tenant Management:** Create, update, and monitor tenants (fuel station organizations).
- **Plan & Feature Management:** Update plan limits/features in `backend/src/config/planConfig.ts` and re-generate documentation.
- **User Management:** Oversee global users, reset passwords, and manage SuperAdmin accounts.
- **Billing & Analytics:** Monitor usage, enforce billing, and review analytics dashboards (see roadmap for Stripe integration).
- **System Health:** Monitor logs, errors, and database health.

---

## Key Scripts & Commands

### Database
- **Seed Database:**
  ```sh
  cd backend
  npm run db:seed
  ```
- **Reset Database:**
  ```sh
  cd backend
  npm run db:reset
  ```
- **Migrate Database:**
  ```sh
  cd backend
  npm run db:migrate
  ```

### Documentation
- **Update ERP/Feature Matrix:**
  ```sh
  node scripts/generate-erp-md.js
  ```
- **Update API Summary:**
  ```sh
  node scripts/generate-api-docs.js
  ```
- **View API Docs (Swagger UI):**
  - Start backend server, then visit: `http://localhost:PORT/docs`

### Testing
- **Run All Tests:**
  ```sh
  cd backend
  npm test
  ```

---

## Maintenance Tasks
- **Update Plan/Feature Matrix:** Edit `planConfig.ts` and re-run doc scripts.
- **Add/Remove SuperAdmins:** Update user records in the public schema.
- **Monitor Logs:** Check backend logs for errors and warnings.
- **Monitor Usage:** Use analytics dashboards (see roadmap for advanced analytics).
- **Upgrade Dependencies:**
  ```sh
  cd backend
  npm update
  ```

---

## Roadmap & Advanced Operations
- **Stripe Billing Integration:** See implementation plan for billing/usage-based monetization.
- **Audit Logging:** Ensure audit logs are enabled and reviewed regularly.
- **Custom Plan Support:** For special tenants, update `planConfig.ts` and seed scripts.
- **Disaster Recovery:** Regularly backup the database and test restore procedures.

---

## Troubleshooting
- **Database Issues:** Use `npm run db:reset` for a fresh schema and seed data in dev/test.
- **API Issues:** Check Swagger UI and OpenAPI spec for endpoint details.
- **Permission/Plan Issues:** Review `planConfig.ts` and middleware for enforcement logic.

---

## References
- [ERP/Feature Matrix](../palnning/erp.md)
- [API Spec](../palnning/api-spec.yaml)
- [API Summary](../palnning/api-summary.md)
- [Database Schema](../database/database-schema.puml)
- [Data Flow Diagram](../database/data-flow-diagram.puml)

---

*Keep this document up-to-date as the platform evolves!*
