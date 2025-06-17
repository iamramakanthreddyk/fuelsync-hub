# FuelSync Hub Authentication System

This document describes the authentication system used in FuelSync Hub.

## Overview

FuelSync Hub uses JWT (JSON Web Token) based authentication for both tenant users and admin users. The authentication flow is as follows:

1. User logs in with email and password
2. Server validates credentials and issues a JWT token
3. Client stores the token and includes it in subsequent requests
4. Server validates the token for each protected request

## Token Format

JWT tokens contain the following claims:

```json
{
  "id": "user-uuid",
  "role": "owner|manager|employee|superadmin",
  "tenant_id": "tenant-uuid",  // Not present for admin users
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890,
  "aud": "fuelsync-tenant-api|fuelsync-admin-api",
  "iss": "fuelsync-auth|fuelsync-admin-auth"
}
```

## Authentication Endpoints

### Tenant Authentication

#### Login

```
POST /api/auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "owner",
      "tenant_id": "tenant-uuid",
      "tenant_name": "Example Tenant",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

#### Register

```
POST /api/auth/register
```

Request:
```json
{
  "name": "New Tenant",
  "email": "owner@example.com",
  "password": "password123",
  "planType": "basic|premium|enterprise"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "message": "Tenant created successfully",
    "tenant": {
      "id": "tenant-uuid",
      "name": "New Tenant",
      "planType": "basic"
    }
  }
}
```

#### Get Current User

```
GET /api/auth/me
```

Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "owner",
      "tenant_id": "tenant-uuid",
      "tenant_name": "Example Tenant",
      "first_name": "John",
      "last_name": "Doe",
      "active": true
    }
  }
}
```

#### Logout

```
POST /api/auth/logout
```

Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "status": "success",
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Admin Authentication

#### Login

```
POST /api/admin/login
```

Request:
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "admin-uuid",
      "email": "admin@example.com",
      "role": "superadmin"
    }
  }
}
```

## Error Responses

All authentication endpoints return standardized error responses:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

Common error codes:
- `INVALID_CREDENTIALS`: Email or password is incorrect
- `USER_NOT_FOUND`: User not found
- `ACCOUNT_SETUP_INCOMPLETE`: User account setup is incomplete
- `INVALID_AUTH_HEADER`: Invalid authorization header format
- `NO_TOKEN`: No token provided
- `TOKEN_EXPIRED`: Token has expired
- `INVALID_TOKEN`: Token validation failed
- `INVALID_TOKEN_CLAIMS`: Token is missing required claims
- `NOT_AUTHENTICATED`: User is not authenticated
- `INSUFFICIENT_PERMISSIONS`: User does not have required permissions

## Frontend Implementation

The frontend stores JWT tokens in localStorage and includes them in API requests using the Authorization header:

```typescript
// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url?.startsWith('/admin');
    const token = localStorage.getItem(isAdminRoute ? 'admin_token' : 'token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

## Role-Based Access Control

The backend provides a `requireRole` middleware to restrict access to endpoints based on user roles:

```typescript
// Example usage
router.get('/sensitive-endpoint', authenticateJWT, requireRole(['owner', 'manager']), controller.handler);
```

The frontend uses a `ProtectedRoute` component to restrict access to pages based on user roles:

```tsx
// Example usage
<ProtectedRoute requiredRoles={['owner']}>
  <OwnerOnlyComponent />
</ProtectedRoute>
```

## Security Considerations

1. JWT tokens are signed using HMAC-SHA256 (HS256) algorithm
2. Tokens include audience and issuer claims to prevent token misuse
3. Tokens expire after a configurable period (default: 24 hours for tenant users, 12 hours for admin users)
4. Sensitive routes are protected with role-based access control
5. Rate limiting is applied to authentication endpoints to prevent brute force attacks