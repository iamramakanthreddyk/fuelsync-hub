# FuelSync Hub Backend

This is the backend for the FuelSync Hub multi-tenant fuel station ERP system.

## Project Structure

The backend follows a feature-based structure:

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Express middlewares
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── tests/          # Unit and integration tests
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Authentication System

The authentication system uses JWT (JSON Web Token) for both tenant users and admin users.

### Authentication Flow

1. User logs in with email and password
2. Server validates credentials and issues a JWT token
3. Client stores the token and includes it in subsequent requests
4. Server validates the token for each protected request

### JWT Tokens

JWT tokens contain the following claims:

- `id`: User ID
- `role`: User role (owner, manager, employee, superadmin)
- `tenant_id`: Tenant ID (not present for admin users)
- `email`: User email (optional)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp
- `aud`: Audience (fuelsync-tenant-api or fuelsync-admin-api)
- `iss`: Issuer (fuelsync-auth or fuelsync-admin-auth)

### Authentication Middleware

The `authenticateJWT` middleware validates JWT tokens and adds the decoded payload to `req.user`.

```typescript
// Protect a route with JWT authentication
router.get('/protected', authenticateJWT, controller.handler);
```

### Role-Based Access Control

The `requireRole` middleware restricts access to routes based on user roles.

```typescript
// Restrict access to owners and managers
router.get('/admin-only', authenticateJWT, requireRole(['owner', 'manager']), controller.handler);
```

## Environment Variables

The following environment variables are used for authentication:

```
# JWT Configuration for Tenant Users
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_AUDIENCE=fuelsync-tenant-api
JWT_ISSUER=fuelsync-auth

# JWT Configuration for Admin Users
ADMIN_JWT_SECRET=your-admin-secret-key
ADMIN_JWT_EXPIRES_IN=12h
ADMIN_JWT_AUDIENCE=fuelsync-admin-api
ADMIN_JWT_ISSUER=fuelsync-admin-auth
```

## Testing

Run tests with:

```bash
npm test
```

The test suite includes:

- Unit tests for auth service and middleware
- Integration tests for auth endpoints
- End-to-end tests for authentication flow