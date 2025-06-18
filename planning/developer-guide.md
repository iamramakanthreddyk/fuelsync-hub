# FuelSync Hub - Developer Guide

This guide is for developers integrating with, extending, or contributing to FuelSync Hub.

---

## Project Structure
- **backend/**: Node.js/Express API, PostgreSQL, business logic, plan enforcement, and documentation automation.
- **frontend/**: Next.js React app for all user/admin dashboards and forms.
- **planning/**: All documentation, diagrams, and onboarding guides.
- **database/**: PlantUML ERD and data flow diagrams.
- **scripts/**: Automation scripts for docs and setup.

---

## Key Concepts
- **Multi-Tenancy:** Each tenant (organization) has its own schema. SuperAdmin manages all tenants.
- **Plan Enforcement:** All entity/feature limits are enforced via `planConfig.ts` and middleware/services.
- **Permissions:** Role-based access control for all major actions.
- **Automated Docs:** ERP matrix and API summary are generated from config/spec.

---

## Setup & Development

1. **Clone the Repo:**
   ```sh
   git clone <repo-url>
   cd fuelsync-hub
   ```
2. **Install Dependencies:**
   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Database Setup:**
   ```sh
   cd backend
   npm run db:migrate
   npm run db:seed
   ```
4. **Run the App:**
   ```sh
   cd backend && npm run dev
   cd ../frontend && npm run dev
   ```
5. **Docs & Diagrams:**
   - See `planning/README.md` for all documentation links.
   - Update docs with `node scripts/generate-erp-md.js` and `node scripts/generate-api-docs.js`.

---

## Testing
- **Backend:**
  ```sh
  cd backend
  npm test
  ```
- **Frontend:**
  ```sh
  cd frontend
  npm test
  ```

---

## Contributing
- Follow code style and linting rules (`eslint`, `tsconfig`).
- Add/expand tests for new features.
- Update documentation and diagrams as needed.
- Use the service layer for all business logic.

---

## References
- [API Spec](./api-spec.yaml)
- [ERP/Feature Matrix](./erp.md)
- [SuperAdmin Manual](./superadmin-manual.md)
- [User Guide](./user-guide.md)

---

*For questions, see the SuperAdmin or open an issue in the repository.*
