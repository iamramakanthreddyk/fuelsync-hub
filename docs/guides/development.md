# Development Guide

## Database Management

### Migrations
Migrations are versioned and run in order. Create new migrations in `backend/db/migrations/`:

```sql
-- Example: 001_init_schema.sql
CREATE TYPE user_role AS ENUM ('superadmin', 'owner', 'manager', 'employee');
...
```

### Running Migrations
```bash
npm run db:migrate   # Run pending migrations
npm run db:rollback  # Rollback last batch
npm run db:reset    # Reset and reseed database
```

## API Development

### Adding New Endpoints
1. Create route in `backend/src/routes/`
2. Add controller in `backend/src/controllers/`
3. Update OpenAPI spec in `backend/openapi.yaml`

### Authentication
- Use `requireAuth` middleware for protected routes
- Use `requireAdmin` for admin-only routes
- Use `requireOwner` for owner-specific routes

## Frontend Development

### Component Structure
- Place reusable components in `frontend/src/components/common/`
- Place page-specific components in respective feature folders
- Use Material-UI components for consistency

### State Management
- Use React Context for global state
- Use React Query for API data caching
- Follow the container/presenter pattern

## Testing
- Backend: Jest + Supertest
- Frontend: Jest + React Testing Library
- E2E: Cypress

## CI/CD
- GitHub Actions for CI
- Azure for deployment
