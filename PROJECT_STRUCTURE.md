# FuelSync Hub - Complete Project Structure

## Overview

FuelSync Hub is a comprehensive multi-tenant fuel station management platform with Node.js/Express backend and Next.js frontend.

## Complete Project Structure

```
fuelsync-hub/
├── 📁 backend/                           # Node.js/Express API Server
│   ├── 📁 db/                            # Database Scripts & Migrations
│   │   ├── 📁 migrations/                # Database Migration Files
│   │   │   ├── 📄 000_schema.sql
│   │   │   ├── 📄 20230615_add_creditor_payment_methods.sql
│   │   │   ├── 📄 20230616_add_tender_entries.sql
│   │   │   ├── 📄 20230617_add_fuel_price_history.sql
│   │   │   ├── 📄 20230618_fix_schema_issues.sql
│   │   │   ├── 📄 20250617_210000_create_admin_tables.sql
│   │   │   ├── 📄 20250617_210100_create_validation_triggers.sql
│   │   │   ├── 📄 20250617_210200_seed_admin_user.sql
│   │   │   ├── 📄 20250617_210300_seed_sample_tenants.sql
│   │   │   └── 📄 20250617_210400_update_admin_sessions_token_length.sql
│   │   ├── 📁 schema/
│   │   │   └── 📄 complete_schema.sql
│   │   ├── 📁 scripts/                   # Database Utility Scripts
│   │   │   ├── 📄 clean_db.sql
│   │   │   ├── 📄 clean_db.ts
│   │   │   ├── 📄 create_tenant.sql
│   │   │   ├── 📄 init-db.ts
│   │   │   ├── 📄 migrate.ts
│   │   │   ├── 📄 reset_schema.sql
│   │   │   ├── 📄 reset-db.ts
│   │   │   ├── 📄 rollback.ts
│   │   │   ├── 📄 schema-snapshot.ts
│   │   │   ├── 📄 seed.ts
│   │   │   ├── 📄 update-schema.ts
│   │   │   └── 📄 validate-schema.ts
│   │   ├── 📄 admin-schema.sql           # Admin Schema Definition
│   │   ├── 📄 apply-schema-in-chunks.ts # Schema Application Script
│   │   ├── 📄 apply-validation-triggers.ts
│   │   ├── 📄 check-connection.ts        # Database Connection Test
│   │   ├── 📄 check-creditors-schema.ts
│   │   ├── 📄 check-fix-stations.ts
│   │   ├── 📄 check-payments-schema.ts
│   │   ├── 📄 check-sales-schema.ts
│   │   ├── 📄 copy-users-to-tenant-schemas.ts
│   │   ├── 📄 create-tenant-schema.ts
│   │   ├── 📄 debug-schema.ts
│   │   ├── 📄 dynamic-seed.ts
│   │   ├── 📄 fix-all-relationships.ts   # Fix Data Relationships
│   │   ├── 📄 fix-all.ts
│   │   ├── 📄 fix-tenant-id.ts
│   │   ├── 📄 fix-user-station-relationships.ts
│   │   ├── 📄 fix-user-stations.ts
│   │   ├── 📄 fixed-seed.ts
│   │   ├── 📄 improved-seed.ts
│   │   ├── 📄 inspect-schema.ts
│   │   ├── 📄 migrate.ts
│   │   ├── 📄 pool.ts
│   │   ├── 📄 run-migrations.ts
│   │   ├── 📄 schema-info.json
│   │   ├── 📄 schema.sql                 # Main Schema Definition
│   │   ├── 📄 seed-admin.ts
│   │   ├── 📄 seed-all.ts
│   │   ├── 📄 seed-credit-sales.ts
│   │   ├── 📄 seed-tenant-users.ts
│   │   ├── 📄 seed.ts
│   │   ├── 📄 setup-admin.ts
│   │   ├── 📄 setup-db.ts               # Main Database Setup
│   │   ├── 📄 setup-local-env.ts
│   │   ├── 📄 simple-seed.ts            # Simple Data Seeding
│   │   ├── 📄 test-admin-login.ts
│   │   ├── 📄 universal-seed.ts
│   │   ├── 📄 validation-triggers.sql
│   │   ├── 📄 verify-admin.ts
│   │   ├── 📄 verify-seed.ts            # Verify Database Setup
│   │   └── 📄 verify-tenant-schemas.ts
│   ├── 📁 openapi/                       # API Documentation
│   │   ├── 📄 admin-api.yaml
│   │   └── 📄 tenant-api.yaml
│   ├── 📁 public/
│   │   └── 📄 admin-login-test.html
│   ├── 📁 scripts/
│   │   └── 📄 setup-db.ps1
│   ├── 📁 src/                           # Source Code
│   │   ├── 📁 config/                    # Configuration Files
│   │   │   ├── 📄 database.ts
│   │   │   ├── 📄 environment.ts
│   │   │   ├── 📄 permissions.ts
│   │   │   ├── 📄 planConfig.ts
│   │   │   └── 📄 planFeatures.ts
│   │   ├── 📁 controllers/               # API Route Controllers
│   │   │   ├── 📁 admin/                 # Admin Controllers
│   │   │   │   ├── 📄 auth.controller.ts
│   │   │   │   ├── 📄 dashboard.controller.ts
│   │   │   │   ├── 📄 station.controller.ts
│   │   │   │   └── 📄 user.controller.ts
│   │   │   ├── 📄 admin-auth.controller.ts
│   │   │   ├── 📄 admin-dashboard.controller.ts
│   │   │   ├── 📄 admin-report.controller.ts
│   │   │   ├── 📄 admin-settings.controller.ts
│   │   │   ├── 📄 admin-tenant.controller.ts
│   │   │   ├── 📄 analytics.controller.ts
│   │   │   ├── 📄 auth.controller.ts
│   │   │   ├── 📄 creditor.controller.ts
│   │   │   ├── 📄 dashboard.controller.ts
│   │   │   ├── 📄 fuel-price.controller.ts
│   │   │   ├── 📄 nozzle.controller.ts
│   │   │   ├── 📄 nozzleReading.controller.ts
│   │   │   ├── 📄 plan.controller.ts
│   │   │   ├── 📄 pump.controller.ts
│   │   │   ├── 📄 reconciliation.controller.ts
│   │   │   ├── 📄 report.controller.ts
│   │   │   ├── 📄 sale.controller.ts
│   │   │   ├── 📄 station.controller.ts
│   │   │   ├── 📄 tenant.controller.ts
│   │   │   ├── 📄 tender.controller.ts
│   │   │   └── 📄 user-station.controller.ts
│   │   ├── 📁 db/
│   │   │   └── 📁 migrations/
│   │   ├── 📁 middlewares/               # Express Middlewares
│   │   │   ├── 📄 adminAuth.ts
│   │   │   ├── 📄 auditLog.ts
│   │   │   ├── 📄 auth.ts
│   │   │   ├── 📄 error.ts
│   │   │   ├── 📄 permissions.ts
│   │   │   ├── 📄 planLimits.ts
│   │   │   ├── 📄 rateLimit.ts
│   │   │   ├── 📄 security.ts
│   │   │   ├── 📄 station-access.ts
│   │   │   ├── 📄 superadmin.ts
│   │   │   ├── 📄 tenant.ts
│   │   │   └── 📄 validation.ts
│   │   ├── 📁 models/                    # Data Models
│   │   │   ├── 📄 nozzle.schema.ts
│   │   │   ├── 📄 pump.schema.ts
│   │   │   ├── 📄 station.schema.ts
│   │   │   └── 📄 user.model.ts
│   │   ├── 📁 routes/                    # API Routes
│   │   │   ├── 📁 admin/                 # Admin Routes
│   │   │   │   ├── 📄 auth.routes.ts
│   │   │   │   ├── 📄 dashboard.routes.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 station.routes.ts
│   │   │   │   └── 📄 user.routes.ts
│   │   │   ├── 📄 admin-auth.routes.ts
│   │   │   ├── 📄 admin-report.routes.ts
│   │   │   ├── 📄 admin-settings.routes.ts
│   │   │   ├── 📄 admin.routes.ts
│   │   │   ├── 📄 analytics.routes.ts
│   │   │   ├── 📄 auth.routes.ts
│   │   │   ├── 📄 creditor.routes.ts
│   │   │   ├── 📄 dashboard.routes.ts
│   │   │   ├── 📄 direct-admin-auth.routes.ts
│   │   │   ├── 📄 docs.routes.ts
│   │   │   ├── 📄 fuel-price.routes.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 nozzle.routes.ts
│   │   │   ├── 📄 nozzleReading.routes.ts
│   │   │   ├── 📄 plan.routes.ts
│   │   │   ├── 📄 pump.routes.ts
│   │   │   ├── 📄 reconciliation.routes.ts
│   │   │   ├── 📄 report.routes.ts
│   │   │   ├── 📄 sale.routes.ts
│   │   │   ├── 📄 station.routes.ts
│   │   │   ├── 📄 tenant.routes.ts
│   │   │   ├── 📄 tender.routes.ts
│   │   │   └── 📄 user-station.routes.ts
│   │   ├── 📁 services/                  # Business Logic Services
│   │   │   ├── 📁 admin/                 # Admin Services
│   │   │   │   ├── 📄 auth.service.ts
│   │   │   │   ├── 📄 dashboard.service.ts
│   │   │   │   ├── 📄 station.service.ts
│   │   │   │   └── 📄 user.service.ts
│   │   │   ├── 📄 admin-auth.service.ts
│   │   │   ├── 📄 admin-report.service.ts
│   │   │   ├── 📄 admin-settings.service.ts
│   │   │   ├── 📄 admin-tenant.service.ts
│   │   │   ├── 📄 auth.service.ts
│   │   │   ├── 📄 creditor.service.ts
│   │   │   ├── 📄 db.service.ts
│   │   │   ├── 📄 fuel-price.service.ts
│   │   │   ├── 📄 nozzle.service.ts
│   │   │   ├── 📄 plan.service.ts
│   │   │   ├── 📄 pump.service.ts
│   │   │   ├── 📄 reconciliation.service.ts
│   │   │   ├── 📄 report.service.ts
│   │   │   ├── 📄 sales.service.ts
│   │   │   ├── 📄 station.service.ts
│   │   │   ├── 📄 tenant.service.ts
│   │   │   ├── 📄 tender.service.ts
│   │   │   ├── 📄 user-station.service.ts
│   │   │   └── 📄 user.service.ts
│   │   ├── 📁 tests/                     # Test Files
│   │   │   ├── 📄 auth.integration.test.ts
│   │   │   ├── 📄 auth.middleware.test.ts
│   │   │   ├── 📄 auth.service.test.ts
│   │   │   ├── 📄 auth.test.ts
│   │   │   ├── 📄 reconciliation.test.ts
│   │   │   ├── 📄 sales.test.ts
│   │   │   └── 📄 station.test.ts
│   │   ├── 📁 types/                     # TypeScript Type Definitions
│   │   │   ├── 📄 express-session.d.ts
│   │   │   ├── 📄 express.d.ts
│   │   │   ├── 📄 jwt-payload.d.ts
│   │   │   └── 📄 userSession.ts
│   │   ├── 📁 utils/                     # Utility Functions
│   │   │   ├── 📄 cache.ts
│   │   │   ├── 📄 monitoring.ts
│   │   │   ├── 📄 uuid.ts
│   │   │   └── 📄 validators.ts
│   │   ├── 📄 app.ts                     # Express App Configuration
│   │   ├── 📄 README.md
│   │   └── 📄 server.ts                  # Main Server Entry Point
│   ├── 📄 .env                           # Environment Variables
│   ├── 📄 .env.example                   # Environment Template
│   ├── 📄 .gitignore
│   ├── 📄 CHANGELOG.md
│   ├── 📄 jest.config.js                 # Jest Test Configuration
│   ├── 📄 openapi.yaml                   # API Documentation
│   ├── 📄 package-lock.json
│   ├── 📄 package.json                   # Backend Dependencies
│   ├── 📄 start-server.js
│   └── 📄 tsconfig.json                  # TypeScript Configuration
│
├── 📁 frontend/                          # Next.js React Application
│   ├── 📁 .next/                         # Next.js Build Output (Generated)
│   │   ├── 📁 cache/
│   │   ├── 📁 server/
│   │   └── 📁 static/
│   ├── 📁 public/                        # Static Assets
│   │   ├── 📄 file.svg
│   │   ├── 📄 globe.svg
│   │   ├── 📄 next.svg
│   │   ├── 📄 vercel.svg
│   │   └── 📄 window.svg
│   ├── 📁 src/                           # Source Code
│   │   ├── 📁 components/                # React Components
│   │   │   ├── 📁 admin/                 # Admin Components
│   │   │   │   ├── 📄 DashboardRecentTenants.tsx
│   │   │   │   ├── 📄 SystemHealth.tsx
│   │   │   │   └── 📄 UserForm.tsx
│   │   │   ├── 📁 auth/                  # Authentication Components
│   │   │   │   ├── 📄 LogoutButton.tsx
│   │   │   │   ├── 📄 NavigationGuard.tsx
│   │   │   │   ├── 📄 ProtectedRoute.tsx
│   │   │   │   └── 📄 README.md
│   │   │   ├── 📁 common/                # Shared Components
│   │   │   │   ├── 📄 ErrorAlert.tsx
│   │   │   │   ├── 📄 LoadingIndicator.tsx
│   │   │   │   └── 📄 StationSelector.jsx
│   │   │   ├── 📁 dashboard/             # Dashboard Components
│   │   │   │   ├── 📄 RecentSales.tsx
│   │   │   │   └── 📄 StatCard.tsx
│   │   │   ├── 📁 forms/                 # Form Components
│   │   │   │   ├── 📄 NozzleForm.tsx
│   │   │   │   ├── 📄 PumpForm.tsx
│   │   │   │   ├── 📄 ReconciliationForm.tsx
│   │   │   │   ├── 📄 SaleForm.tsx
│   │   │   │   └── 📄 StationForm.tsx
│   │   │   ├── 📁 layout/                # Layout Components
│   │   │   │   ├── 📄 AdminLayout.tsx
│   │   │   │   ├── 📄 AuthenticatedAdminLayout.tsx
│   │   │   │   ├── 📄 AuthenticatedDashboardLayout.tsx
│   │   │   │   ├── 📄 AuthLayout.tsx
│   │   │   │   └── 📄 DashboardLayout.tsx
│   │   │   ├── 📁 reports/               # Report Components
│   │   │   │   └── 📄 SalesReport.tsx
│   │   │   ├── 📁 sales/                 # Sales Components
│   │   │   │   └── 📄 SaleList.tsx
│   │   │   ├── 📁 stations/              # Station Components
│   │   │   │   ├── 📄 NozzleList.tsx
│   │   │   │   ├── 📄 PumpList.tsx
│   │   │   │   └── 📄 StationCard.tsx
│   │   │   └── 📄 PumpIcon.tsx
│   │   ├── 📁 componentsdebug/           # Debug Components
│   │   │   └── 📄 AuthDebugger.jsx
│   │   ├── 📁 pages/                     # Next.js Pages
│   │   │   ├── 📁 admin/                 # Admin Pages
│   │   │   │   ├── 📁 reports/
│   │   │   │   ├── 📁 stations/
│   │   │   │   ├── 📁 tenants/
│   │   │   │   ├── 📁 users/
│   │   │   │   ├── 📄 dashboard.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 login.tsx
│   │   │   │   └── 📄 settings.tsx
│   │   │   ├── 📁 api/                   # API Routes (Mock/Frontend)
│   │   │   │   ├── 📁 admin/
│   │   │   │   ├── 📁 admin-auth/
│   │   │   │   ├── 📁 auth/
│   │   │   │   ├── 📄 dashboard.ts
│   │   │   │   ├── 📄 sales.ts
│   │   │   │   └── 📄 stations.ts
│   │   │   ├── 📁 dashboard/             # Dashboard Pages
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📁 reconciliations/       # Reconciliation Pages
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📁 reports/               # Report Pages
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📁 sales/                 # Sales Pages
│   │   │   │   ├── 📁 new/
│   │   │   │   │   └── 📄 index.tsx
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📁 settings/              # Settings Pages
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📁 stations/              # Station Pages
│   │   │   │   ├── 📁 [id]/              # Dynamic Station Pages
│   │   │   │   │   ├── 📁 edit/
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   └── 📄 index.tsx
│   │   │   │   ├── 📁 new/
│   │   │   │   │   └── 📄 index.tsx
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📄 _app.tsx               # Next.js App Component
│   │   │   ├── 📄 dashboard1.tsx
│   │   │   ├── 📄 debug.tsx              # Debug/Testing Page
│   │   │   ├── 📄 index.tsx              # Home Page
│   │   │   ├── 📄 login.tsx              # Login Page
│   │   │   ├── 📄 logout.tsx             # Logout Page
│   │   │   ├── 📄 nozzle-entry.tsx
│   │   │   └── 📄 register.tsx
│   │   ├── 📁 styles/                    # CSS Styles
│   │   │   └── 📄 globals.css
│   │   ├── 📁 types/                     # TypeScript Types
│   │   │   ├── 📄 api.ts
│   │   │   └── 📄 index.ts
│   │   └── 📁 utils/                     # Utility Functions
│   │       ├── 📄 api.ts
│   │       ├── 📄 auth.ts
│   │       ├── 📄 authHelper.js
│   │       └── 📄 errorHandler.ts
│   ├── 📄 .eslintrc.json                 # ESLint Configuration
│   ├── 📄 .gitignore
│   ├── 📄 eslint.config.mjs
│   ├── 📄 next-env.d.ts                  # Next.js Types
│   ├── 📄 next.config.js                 # Next.js Configuration
│   ├── 📄 next.config.ts
│   ├── 📄 package-lock.json
│   ├── 📄 package.json                   # Frontend Dependencies
│   ├── 📄 postcss.config.mjs
│   ├── 📄 README.md
│   └── 📄 tsconfig.json                  # TypeScript Configuration
│
├── 📁 database/                          # Database Documentation
│   ├── 📄 data-flow-diagram.puml
│   └── 📄 database-schema.puml
│
├── 📁 docs/                              # Project Documentation
│   ├── 📁 examples/
│   │   ├── 📄 api-client.js
│   │   └── 📄 curl-examples.md
│   ├── 📁 guides/
│   │   └── 📄 development.md
│   ├── 📄 API.md
│   ├── 📄 ARCHITECTURE.md
│   ├── 📄 Architecture.png
│   ├── 📄 AUTH.md
│   ├── 📄 BUSINESS_RULES.md
│   ├── 📄 CHALLENGES.md
│   ├── 📄 CHANGELOG_AI.md
│   ├── 📄 creditors.md
│   ├── 📄 DASHBOARDS.md
│   ├── 📄 DATABASE_GUIDE.md
│   ├── 📄 DATABASE.md
│   ├── 📄 ERD.md
│   ├── 📄 fuel-pricing.md
│   ├── 📄 PLANS.md
│   ├── 📄 PRODUCT_STORY.md
│   ├── 📄 README.md
│   ├── 📄 ROLES.md
│   ├── 📄 SEEDING.md
│   ├── 📄 SUPERADMIN.md
│   ├── 📄 tender-shifts.md
│   ├── 📄 TROUBLESHOOTING.md
│   └── 📄 user-station-assignments.md
│
├── 📁 planning/                          # Project Planning
│   ├── 📄 api-spec.yaml
│   ├── 📄 api-summary.md
│   ├── 📄 backend setup
│   ├── 📄 developer-guide.md
│   ├── 📄 erp.md
│   ├── 📄 frontend setup
│   ├── 📄 FuelSync Hub - Implementation Plan
│   ├── 📄 initial-setup.yaml
│   ├── 📄 README.md
│   ├── 📄 sql-tables
│   ├── 📄 superadmin-manual.md
│   └── 📄 user-guide.md
│
├── 📁 scripts/                           # Utility Scripts
│   ├── 📄 generate-api-docs.js
│   └── 📄 generate-erp-md.js
│
├── 📄 .gitignore                         # Git Ignore Rules
├── 📄 CLEANUP.md
├── 📄 codex-bootstrap.md
├── 📄 DATA_FLOW_DIAGRAM.md               # Data Flow Documentation
├── 📄 DATA_FLOW.md
├── 📄 DATABASE_OPERATIONS.md             # Database Operations Guide
├── 📄 DATABASE_SCHEMA.md
├── 📄 DATABASE_SETUP.md
├── 📄 FIXES_SUMMARY.md
├── 📄 FUELSYNC_GUIDE.md
├── 📄 LICENSE
├── 📄 package-lock.json
├── 📄 package.json                       # Root Dependencies
├── 📄 PROJECT_STRUCTURE.md               # This File
├── 📄 PROJECT_SUMMARY.md
├── 📄 README.md                          # Main Project README
├── 📄 schema.dbml
├── 📄 SEED_GUIDE.md
├── 📄 setup.bat                          # Windows Setup Script
├── 📄 setup.sh                           # Unix/Linux Setup Script
├── 📄 start-dev.bat                      # Windows Dev Server Script
├── 📄 start-dev.sh                       # Unix/Linux Dev Server Script
├── 📄 SUPERADMIN_GUIDE.md
├── 📄 SUPERADMIN_IMPLEMENTATION_PLAN.md
├── 📄 TENANT_SETUP.md
├── 📄 TENANT_USER_GUIDE.md
├── 📄 TESTING_GUIDE.md
├── 📄 TROUBLESHOOTING.md
└── 📄 USER_GUIDE.md
```

## Key Architecture Components

### 🔧 Backend Architecture
- **Multi-tenant PostgreSQL** with schema separation
- **Express.js** with TypeScript
- **JWT Authentication** with role-based access
- **Comprehensive API** for all operations
- **Database migrations** and seeding scripts
- **Admin and tenant** separate authentication systems

### 🎨 Frontend Architecture
- **Next.js 13** with React 18
- **Material-UI (MUI)** component library
- **TypeScript** for type safety
- **Protected routes** with authentication
- **Admin and tenant** separate interfaces
- **Real-time dashboard** with KPIs

### 🗄️ Database Structure
- **Public Schema**: Tenants, users, admin tables
- **Tenant Schemas**: Isolated data per tenant
- **Multi-level relationships**: Stations → Pumps → Nozzles → Sales
- **User-station assignments** for access control
- **Credit management** system

### 📊 Key Features
- **Multi-tenant SaaS** architecture
- **Role-based access control** (Owner, Manager, Employee, Admin)
- **Station management** with pumps and nozzles
- **Sales recording** and reporting
- **Credit customer** management
- **Real-time dashboard** with analytics
- **Comprehensive admin** panel

## 🚀 Quick Start Commands

### Setup
```bash
# Automated setup
./setup.sh          # Unix/Linux/macOS
setup.bat            # Windows

# Start development
./start-dev.sh       # Unix/Linux/macOS
start-dev.bat        # Windows
```

### Database Operations
```bash
cd backend
npm run db:fix       # Fix relationships
npm run db:reset     # Reset database
npm run db:check     # Check connection
npm run db:verify-seed # Verify setup
```

### Development
```bash
# Backend (Port 3001)
cd backend && npm run dev

# Frontend (Port 3000)
cd frontend && npm run dev
```

## 🔐 Default Credentials
- **Owner**: owner@demofuel.com / password123
- **Manager**: manager@demofuel.com / password123
- **Employee**: employee@demofuel.com / password123
- **Admin**: admin@fuelsync.com / admin123

## 🌐 Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Debug Page**: http://localhost:3000/debug