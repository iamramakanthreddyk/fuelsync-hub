# User-Station Assignment

## Overview
The User-Station Assignment system allows tenant owners and managers to assign users to specific stations with different roles. This enables role-based access control at the station level, ensuring users only have access to the stations they are assigned to.

## Features
- Assign users to stations with specific roles
- Update user roles at stations
- Remove users from stations
- Get all users assigned to a station
- Get all stations a user is assigned to
- Check if a user has access to a station

## Station Roles
The system supports the following station roles:
- `owner` - Full access to the station
- `manager` - Can manage station operations but cannot change ownership
- `attendant` - Can perform day-to-day operations like recording sales

## API Endpoints

### User-Station Assignments
- `POST /api/stations/assignments` - Assign a user to a station
- `DELETE /api/stations/users/:userId/stations/:stationId` - Remove a user from a station
- `PATCH /api/stations/users/:userId/stations/:stationId/role` - Update a user's role at a station
- `GET /api/stations/:stationId/users` - Get all users assigned to a station
- `GET /api/stations/users/:userId/assignments` - Get all station assignments for a user

## Role-Based Permissions
- Tenant owners can assign any role to users
- Tenant managers can only assign and remove attendants
- Only tenant owners can update user roles at stations
- Users can only access stations they are assigned to

## Example Usage

### Assign a User to a Station
```http
POST /api/stations/assignments
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "stationId": "550e8400-e29b-41d4-a716-446655440001",
  "role": "manager"
}
```

### Get All Users Assigned to a Station
```http
GET /api/stations/550e8400-e29b-41d4-a716-446655440001/users
Authorization: Bearer <token>
```

### Update a User's Role at a Station
```http
PATCH /api/stations/users/550e8400-e29b-41d4-a716-446655440000/stations/550e8400-e29b-41d4-a716-446655440001/role
Content-Type: application/json
Authorization: Bearer <token>

{
  "role": "attendant"
}
```

### Remove a User from a Station
```http
DELETE /api/stations/users/550e8400-e29b-41d4-a716-446655440000/stations/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

## Database Schema

### user_stations table
```sql
CREATE TABLE user_stations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  role station_user_role NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, station_id)
);
```

### station_user_role enum
```sql
CREATE TYPE station_user_role AS ENUM ('owner', 'manager', 'attendant');
```