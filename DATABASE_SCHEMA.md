# FuelSync Hub Database Schema

## Entity Relationship Diagram

```
Superadmin
 └── Creates Tenants
     └── Tenant
         └── Owner (user.role = 'owner')
             └── Must own at least 1 Station
                 └── Must have at least 1 Pump
                     └── Each Pump must have at least 2 Nozzles
             └── Users (role = 'manager' or 'employee')
                 └── Assigned to station(s) via `user_stations`
```

## Key Tables and Relationships

### Core Tables

1. **tenants**
   - Primary table for multi-tenant architecture
   - Each tenant represents a fuel station company
   - Contains subscription plan, contact info, etc.

2. **users**
   - All users in the system
   - Has `tenant_id` foreign key to `tenants`
   - `role` can be 'owner', 'manager', or 'employee'

3. **stations**
   - Fuel stations
   - Has `tenant_id` foreign key to `tenants`
   - Each station must belong to a tenant

4. **user_stations**
   - Junction table for user-station assignments
   - Links users to stations with a specific role
   - `role` can be 'owner', 'manager', or 'attendant'

5. **pumps**
   - Fuel pumps at stations
   - Has `station_id` foreign key to `stations`
   - Each station must have at least one pump

6. **nozzles**
   - Nozzles on pumps
   - Has `pump_id` foreign key to `pumps`
   - Each pump must have at least two nozzles
   - Each nozzle has a specific `fuel_type`

### Operational Tables

7. **fuel_price_history**
   - Historical fuel prices
   - Has `station_id` foreign key to `stations`
   - Has `fuel_type` to match with nozzles

8. **sales**
   - Fuel sales records
   - Has `station_id`, `nozzle_id`, and `user_id` foreign keys
   - Records volume, price, payment method, etc.

9. **creditors**
   - Customers with credit accounts
   - Used for credit sales

10. **shifts**
    - Employee work shifts
    - Has `station_id` and `user_id` foreign keys

11. **tender_entries**
    - Cash, card, and other payments
    - Has `shift_id`, `station_id`, and `user_id` foreign keys

12. **day_reconciliations**
    - Daily financial reconciliations
    - Has `station_id` foreign key

## Required Relationships

1. **Tenant → Owner**
   - Each tenant must have at least one user with role 'owner'

2. **Owner → Station**
   - Each owner must be assigned to at least one station with role 'owner' in `user_stations`

3. **Station → Pump**
   - Each station must have at least one pump

4. **Pump → Nozzle**
   - Each pump must have at least two nozzles

## Multi-Tenant Architecture

FuelSync Hub uses a schema-per-tenant approach:

1. The `public` schema contains shared tables like `tenants` and `admin_users`
2. Each tenant gets its own schema named `tenant_[uuid]` with isolated tables
3. The tenant schema contains copies of all operational tables

## Data Flow

1. **User Authentication**
   - Users are authenticated against the `public.users` table
   - The JWT token contains the user's `tenant_id`

2. **Tenant Context**
   - The tenant middleware sets `req.schemaName` based on the user's `tenant_id`
   - All database operations use this schema name

3. **Station Operations**
   - When creating a station, the `tenant_id` must be included
   - The station is created in the tenant's schema

4. **User-Station Assignment**
   - Users are assigned to stations via the `user_stations` table
   - This determines what stations a user can access and their role at each station

## Seed Data Order

For proper initialization, seed data must be created in this order:

1. Create tenant
2. Create owner with tenant_id
3. Create station with tenant_id
4. Assign owner to station
5. Create pumps for station
6. Create nozzles for pumps
7. Create fuel prices for station
8. Create manager and employee users
9. Assign users to stations
10. Create sample sales and other operational data

## Validation Rules

The system enforces these validation rules:

1. Each owner must have at least one station
2. Each station must have at least one pump
3. Each pump must have at least two nozzles
4. Each station must have fuel prices for each fuel type

These rules ensure that the system has the minimum required data to function properly.