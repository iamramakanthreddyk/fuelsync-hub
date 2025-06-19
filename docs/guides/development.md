# Development Guide

## Database Management

### Database Setup
The full schema lives in `backend/db/schema.sql`. Use the provided scripts to
apply and manage the database:

```bash
npm run db:setup     # Apply schema and seed data
npm run db:reset     # Recreate schema and seed data
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
