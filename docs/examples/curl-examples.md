# FuelSync Hub API - cURL Examples

This document provides examples of how to interact with the FuelSync Hub API using cURL.

## Authentication

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "status": "success",
  "data": {
    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "owner@example.com",
      "role": "owner",
      "tenant_id": "tenant-uuid",
      "tenant_name": "Example Tenant",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Register

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Tenant",
    "email": "owner@example.com",
    "password": "password123",
    "planType": "basic"
  }'
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

### Get Current User

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "owner@example.com",
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

### Logout

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

## Stations

### Get All Stations

```bash
curl -X GET http://localhost:3001/api/stations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Station by ID

```bash
curl -X GET http://localhost:3001/api/stations/station-uuid \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Create Station

```bash
curl -X POST http://localhost:3001/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Downtown Station",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "contact_phone": "555-123-4567"
  }'
```

### Update Station

```bash
curl -X PUT http://localhost:3001/api/stations/station-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Downtown Station Updated",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "contact_phone": "555-123-4567"
  }'
```

### Delete Station

```bash
curl -X DELETE http://localhost:3001/api/stations/station-uuid \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Dashboard

### Get Dashboard Stats

```bash
curl -X GET http://localhost:3001/api/dashboard/stats?stationId=station-uuid \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Admin Endpoints

### Admin Login

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpassword"
  }'
```

### Get All Tenants

```bash
curl -X GET http://localhost:3001/api/admin/tenants \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get System Health

```bash
curl -X GET http://localhost:3001/api/admin/system-health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Activate/Deactivate User

```bash
curl -X PATCH http://localhost:3001/api/admin/users/user-uuid/activate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "active": true
  }'
```