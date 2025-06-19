# FuelSync Hub - Data Flow and Relationships

## Entity Relationships

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │
│   Tenant    │───┐   │    User     │       │   Station   │
│             │   │   │             │       │             │
└─────────────┘   │   └──────┬──────┘       └──────┬──────┘
                  │          │                     │
                  └──────────┤                     │
                             │                     │
                      ┌──────┴──────┐              │
                      │             │              │
                      │ UserStation │──────────────┘
                      │             │
                      └──────┬──────┘
                             │
                             │
                      ┌──────┴──────┐       ┌─────────────┐
                      │             │       │             │
                      │    Pump     │───────│   Nozzle    │
                      │             │       │             │
                      └──────┬──────┘       └──────┬──────┘
                             │                     │
                             │                     │
                      ┌──────┴─────────────────────┴──────┐
                      │                                   │
                      │               Sale                │
                      │                                   │
                      └───────────────┬───────────────────┘
                                      │
                                      │
                             ┌────────┴────────┐
                             │                 │
                             │    Creditor     │
                             │                 │
                             └─────────────────┘
```

## Key Relationships

1. **Tenant-User**: Each user belongs to a tenant (tenant_id in users table)
2. **User-Station**: Users are assigned to stations through the user_stations table
3. **Station-Tenant**: Each station belongs to a tenant (tenant_id in stations table)
4. **Station-Pump**: Each pump belongs to a station (station_id in pumps table)
5. **Pump-Nozzle**: Each nozzle belongs to a pump (pump_id in nozzles table)
6. **Sale-Nozzle**: Each sale is recorded through a nozzle (nozzle_id in sales table)
7. **Sale-User**: Each sale is recorded by a user (user_id in sales table)
8. **Sale-Creditor**: Credit sales are linked to creditors (creditor_id in sales table)

## Authentication Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│         │  Login  │         │  JWT    │         │ Request │         │
│ Client  │────────►│ Auth    │────────►│ Client  │────────►│ API     │
│         │         │ Service │         │         │         │ Service │
└─────────┘         └─────────┘         └─────────┘         └─────────┘
                         │                                       │
                         │                                       │
                         ▼                                       ▼
                    ┌─────────┐                            ┌─────────┐
                    │         │                            │         │
                    │ User DB │                            │ Tenant  │
                    │         │                            │ Context │
                    └─────────┘                            └─────────┘
```

## Data Access Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│         │ Request │         │ Tenant  │         │ Query   │         │
│ Client  │────────►│ API     │────────►│ Service │────────►│ Database│
│         │         │ Route   │         │ Layer   │         │         │
└─────────┘         └─────────┘         └─────────┘         └─────────┘
                         │                   │                   │
                         ▼                   │                   │
                    ┌─────────┐              │                   │
                    │         │              │                   │
                    │ Auth    │──────────────┘                   │
                    │ Check   │                                  │
                    └─────────┘                                  │
                         │                                       │
                         ▼                                       │
                    ┌─────────┐                                  │
                    │         │                                  │
                    │ Tenant  │──────────────────────────────────┘
                    │ Context │
                    └─────────┘
```

## Issues Fixed

1. **Dashboard Error**: Modified dashboard controller to automatically select a station if none is provided
2. **User-Station Relationships**: Created script to ensure all users are assigned to at least one station
3. **Station Creation**: Ensured stations are created in both public and tenant schemas
4. **Token Handling**: Fixed token handling in frontend to properly handle "Bearer " prefix

## Database Schema Structure

Each tenant has its own schema in the database:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   PostgreSQL DB                     │
│                                                     │
├─────────────────┬─────────────────┬─────────────────┤
│                 │                 │                 │
│  public schema  │  tenant_1       │  tenant_2       │
│                 │  schema         │  schema         │
│  - tenants      │                 │                 │
│  - users        │  - users        │  - users        │
│  - stations     │  - stations     │  - stations     │
│  - user_stations│  - user_stations│  - user_stations│
│                 │  - pumps        │  - pumps        │
│                 │  - nozzles      │  - nozzles      │
│                 │  - sales        │  - sales        │
│                 │  - creditors    │  - creditors    │
│                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

## Authentication and Authorization

1. **JWT Token**: Contains user ID, role, and tenant ID
2. **Tenant Context**: Set based on user's tenant ID from JWT
3. **Schema Selection**: Database operations use the tenant's schema
4. **Station Access**: Users can only access stations they are assigned to

## Common Issues and Solutions

1. **"Station ID is required"**: This occurs when a user tries to access the dashboard without specifying a station. Fixed by automatically selecting the first available station.

2. **"stations.map is not a function"**: This occurs when the stations data is not an array. Fixed by adding defensive checks in the frontend components.

3. **Token validation errors**: These occur when the token format is incorrect. Fixed by properly handling the "Bearer " prefix in the frontend.

4. **Missing user-station relationships**: These occur when users are not assigned to any stations. Fixed by ensuring all users are assigned to at least one station.