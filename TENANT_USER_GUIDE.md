# FuelSync Hub - Tenant & User Guide

This document provides comprehensive information about tenant and user roles, features, and API endpoints in the FuelSync Hub platform.

## Role Hierarchy

FuelSync Hub implements a hierarchical role system:

1. **Superadmin**: Platform administrators with access to all tenants and features
2. **Tenant Owner**: Full access to all features within their tenant
3. **Station Manager**: Access to manage specific stations and their operations
4. **Employee**: Limited access to daily operations at assigned stations

## Tenant Features

### Tenant Dashboard

The tenant dashboard provides an overview of all stations and business performance.

**Key Features:**
- Multi-station overview with key metrics
- Sales trends across all stations
- Inventory status for all stations
- Credit customer summary
- Recent activity across all stations

### Tenant Settings

Tenant settings allow owners to configure tenant-wide parameters.

**Key Features:**
- Tenant profile management
- Subscription plan information
- Billing and payment history
- User management across all stations
- Branding and customization options

### User Management

Tenant owners can manage all users within their tenant.

**Key Features:**
- Create, update, and delete users
- Assign roles (manager, employee)
- Assign users to specific stations
- Set permissions and access controls
- Reset passwords and manage account status

## Station Manager Features

### Station Dashboard

The station dashboard provides an overview of a specific station's performance.

**Key Features:**
- Daily, weekly, and monthly sales summary
- Fuel inventory levels
- Pump status and activity
- Recent transactions
- Alerts for low inventory or issues

### Sales Management

Managers can record and manage all sales transactions.

**Key Features:**
- Record fuel sales
- Process different payment methods
- Manage credit sales and collections
- View sales history and trends
- Generate receipts and invoices

### Inventory Management

Managers can track and manage fuel inventory.

**Key Features:**
- Record fuel deliveries
- Track inventory levels
- Set low inventory alerts
- View inventory history
- Reconcile physical and system inventory

### Pump Management

Managers can configure and monitor fuel pumps.

**Key Features:**
- Configure pumps and nozzles
- Set fuel prices
- Monitor pump activity
- Troubleshoot pump issues
- Generate pump reports

### Reports

Managers can generate various reports for their station.

**Key Features:**
- Sales reports (daily, weekly, monthly)
- Inventory reports
- Credit customer reports
- Shift reports
- Custom report generation

## Employee Features

### Sales Recording

Employees can record sales transactions.

**Key Features:**
- Record fuel sales
- Process payments
- Generate receipts
- View recent transactions
- Report issues

### Shift Management

Employees can manage their shifts.

**Key Features:**
- Start and end shifts
- Record cash drawer counts
- Submit shift reports
- View shift history

## API Endpoints

### Tenant Authentication

- `POST /api/auth/login` - Login as tenant user
- `POST /api/auth/logout` - Logout tenant user session
- `GET /api/auth/me` - Get current tenant user
- `POST /api/auth/refresh` - Refresh authentication token

### Tenant Dashboard

- `GET /api/dashboard` - Get tenant dashboard data
- `GET /api/dashboard/sales` - Get sales summary
- `GET /api/dashboard/inventory` - Get inventory summary
- `GET /api/dashboard/activity` - Get recent activity

### User Management

- `GET /api/users` - List all users in tenant
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete a user
- `PUT /api/users/:id/password` - Reset user password
- `PUT /api/users/:id/status` - Update user status

### Station Management

- `GET /api/stations` - List all stations in tenant
- `GET /api/stations/:id` - Get station details
- `POST /api/stations` - Create a new station
- `PUT /api/stations/:id` - Update station details
- `DELETE /api/stations/:id` - Delete a station

### Pump Management

- `GET /api/stations/:stationId/pumps` - List all pumps in station
- `GET /api/pumps/:id` - Get pump details
- `POST /api/stations/:stationId/pumps` - Create a new pump
- `PUT /api/pumps/:id` - Update pump details
- `DELETE /api/pumps/:id` - Delete a pump

### Nozzle Management

- `GET /api/pumps/:pumpId/nozzles` - List all nozzles in pump
- `GET /api/nozzles/:id` - Get nozzle details
- `POST /api/pumps/:pumpId/nozzles` - Create a new nozzle
- `PUT /api/nozzles/:id` - Update nozzle details
- `DELETE /api/nozzles/:id` - Delete a nozzle

### Sales Management

- `GET /api/sales` - List all sales
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create a new sale
- `PUT /api/sales/:id` - Update sale details
- `DELETE /api/sales/:id` - Delete a sale
- `GET /api/sales/credit` - List all credit sales
- `POST /api/sales/:id/payment` - Record payment for credit sale

### Inventory Management

- `GET /api/inventory` - Get current inventory levels
- `GET /api/inventory/history` - Get inventory history
- `POST /api/inventory/delivery` - Record fuel delivery
- `POST /api/inventory/reconciliation` - Reconcile inventory

### Reports

- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/inventory` - Get inventory report
- `GET /api/reports/credit` - Get credit report
- `GET /api/reports/shift` - Get shift report
- `POST /api/reports/custom` - Generate custom report

### Tenant Settings

- `GET /api/settings` - Get tenant settings
- `PUT /api/settings` - Update tenant settings
- `GET /api/settings/subscription` - Get subscription details
- `GET /api/settings/billing` - Get billing history

## Seed Data

### Tenant Seed Data

```sql
-- Sample tenant
INSERT INTO tenants (
  id,
  name,
  email,
  contact_person,
  contact_phone,
  subscription_plan,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo Fuel Company',
  'demo-tenant@fuelsync.com',
  'Demo Admin',
  '555-1234',
  'premium',
  'active'
);

-- Sample users
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  tenant_id,
  phone,
  active
) VALUES
-- Owner
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'owner@demofuel.com',
  '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy', -- password123
  'Demo',
  'Owner',
  'owner',
  '11111111-1111-1111-1111-111111111111',
  '555-1111',
  true
),
-- Manager
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'manager@demofuel.com',
  '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy', -- password123
  'Demo',
  'Manager',
  'manager',
  '11111111-1111-1111-1111-111111111111',
  '555-2222',
  true
),
-- Employee
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'employee@demofuel.com',
  '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy', -- password123
  'Demo',
  'Employee',
  'employee',
  '11111111-1111-1111-1111-111111111111',
  '555-3333',
  true
);

-- Sample station
INSERT INTO stations (
  id,
  name,
  address,
  city,
  state,
  zip,
  contact_phone,
  tenant_id,
  active
) VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Demo Station 1',
  '123 Main St',
  'Anytown',
  'CA',
  '12345',
  '555-1234',
  '11111111-1111-1111-1111-111111111111',
  true
);

-- Sample pump
INSERT INTO pumps (
  id,
  name,
  serial_number,
  station_id,
  active
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Pump 1',
  'SN12345',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  true
);

-- Sample nozzles
INSERT INTO nozzles (
  id,
  number,
  fuel_type,
  pump_id,
  active
) VALUES
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  1,
  'petrol',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  true
),
(
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  2,
  'diesel',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  true
);

-- Sample user-station assignment
INSERT INTO user_stations (
  id,
  user_id,
  station_id,
  role,
  active
) VALUES
(
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'manager',
  true
),
(
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'employee',
  true
);

-- Sample creditor
INSERT INTO creditors (
  id,
  name,
  contact_person,
  contact_phone,
  email,
  address,
  credit_limit,
  tenant_id,
  active
) VALUES (
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  'ABC Company',
  'John Doe',
  '555-4444',
  'john@abccompany.com',
  '456 Oak St, Anytown, CA 12345',
  5000.00,
  '11111111-1111-1111-1111-111111111111',
  true
);

-- Sample sales
INSERT INTO sales (
  id,
  nozzle_id,
  quantity,
  price_per_unit,
  amount,
  payment_method,
  creditor_id,
  created_by,
  tenant_id,
  created_at
) VALUES
(
  'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  20.5,
  4.50,
  92.25,
  'cash',
  NULL,
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
  'llllllll-llll-llll-llll-llllllllllll',
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  30.0,
  4.75,
  142.50,
  'card',
  NULL,
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
  'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  50.0,
  4.50,
  225.00,
  'credit',
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  CURRENT_TIMESTAMP
);

-- Sample inventory delivery
INSERT INTO inventory_deliveries (
  id,
  fuel_type,
  quantity,
  supplier,
  invoice_number,
  station_id,
  created_by,
  tenant_id,
  created_at
) VALUES (
  'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn',
  'petrol',
  5000.0,
  'Fuel Supplier Inc.',
  'INV-12345',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  CURRENT_TIMESTAMP - INTERVAL '3 days'
);
```

## Access Control Matrix

| Feature                  | Superadmin | Tenant Owner | Station Manager | Employee |
|--------------------------|------------|--------------|-----------------|----------|
| **Tenant Management**    |            |              |                 |          |
| View All Tenants         | ✓          |              |                 |          |
| Create/Edit Tenants      | ✓          |              |                 |          |
| Delete Tenants           | ✓          |              |                 |          |
| **User Management**      |            |              |                 |          |
| View All Users           | ✓          | ✓ (tenant)   | ✓ (station)     |          |
| Create/Edit Users        | ✓          | ✓ (tenant)   |                 |          |
| Delete Users             | ✓          | ✓ (tenant)   |                 |          |
| **Station Management**   |            |              |                 |          |
| View All Stations        | ✓          | ✓ (tenant)   | ✓ (assigned)    | ✓ (assigned) |
| Create/Edit Stations     | ✓          | ✓ (tenant)   |                 |          |
| Delete Stations          | ✓          | ✓ (tenant)   |                 |          |
| **Pump Management**      |            |              |                 |          |
| View Pumps               | ✓          | ✓ (tenant)   | ✓ (station)     | ✓ (station) |
| Configure Pumps          | ✓          | ✓ (tenant)   | ✓ (station)     |          |
| **Sales Management**     |            |              |                 |          |
| Record Sales             | ✓          | ✓ (tenant)   | ✓ (station)     | ✓ (station) |
| View Sales History       | ✓          | ✓ (tenant)   | ✓ (station)     | ✓ (limited) |
| Manage Credit Sales      | ✓          | ✓ (tenant)   | ✓ (station)     |          |
| **Inventory Management** |            |              |                 |          |
| Record Deliveries        | ✓          | ✓ (tenant)   | ✓ (station)     |          |
| View Inventory           | ✓          | ✓ (tenant)   | ✓ (station)     | ✓ (station) |
| Reconcile Inventory      | ✓          | ✓ (tenant)   | ✓ (station)     |          |
| **Reports**              |            |              |                 |          |
| System-wide Reports      | ✓          |              |                 |          |
| Tenant Reports           | ✓          | ✓ (tenant)   |                 |          |
| Station Reports          | ✓          | ✓ (tenant)   | ✓ (station)     |          |
| **Settings**             |            |              |                 |          |
| System Settings          | ✓          |              |                 |          |
| Tenant Settings          | ✓          | ✓ (tenant)   |                 |          |
| Station Settings         | ✓          | ✓ (tenant)   | ✓ (station)     |          |

## OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: FuelSync Hub Tenant API
  description: API for FuelSync Hub tenant functionality
  version: 1.0.0
  
servers:
  - url: /api
    description: Default API server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    Error:
      type: object
      properties:
        status:
          type: string
          example: error
        code:
          type: string
          example: UNAUTHORIZED
        message:
          type: string
          example: Unauthorized
    
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        role:
          type: string
          enum: [owner, manager, employee]
        tenantId:
          type: string
          format: uuid
        phone:
          type: string
        active:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    
    Station:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        address:
          type: string
        city:
          type: string
        state:
          type: string
        zip:
          type: string
        contactPhone:
          type: string
        tenantId:
          type: string
          format: uuid
        active:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    
    Pump:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        serialNumber:
          type: string
        stationId:
          type: string
          format: uuid
        active:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    
    Nozzle:
      type: object
      properties:
        id:
          type: string
          format: uuid
        number:
          type: integer
        fuelType:
          type: string
          enum: [petrol, diesel, premium, super, cng, lpg]
        pumpId:
          type: string
          format: uuid
        active:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    
    Sale:
      type: object
      properties:
        id:
          type: string
          format: uuid
        nozzleId:
          type: string
          format: uuid
        quantity:
          type: number
          format: float
        pricePerUnit:
          type: number
          format: float
        amount:
          type: number
          format: float
        paymentMethod:
          type: string
          enum: [cash, card, upi, credit]
        creditorId:
          type: string
          format: uuid
          nullable: true
        createdBy:
          type: string
          format: uuid
        tenantId:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

paths:
  /auth/login:
    post:
      summary: User login
      description: Authenticate as tenant user
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Successful login
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    type: object
                    properties:
                      token:
                        type: string
                      user:
                        $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  
  /auth/logout:
    post:
      summary: User logout
      description: Logout tenant user session
      tags:
        - Authentication
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Successful logout
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  message:
                    type: string
                    example: Logged out successfully
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  
  /auth/me:
    get:
      summary: Get current user
      description: Get current tenant user profile
      tags:
        - Authentication
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  
  /dashboard:
    get:
      summary: Get dashboard data
      description: Get tenant dashboard data
      tags:
        - Dashboard
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    type: object
                    properties:
                      salesSummary:
                        type: object
                      inventorySummary:
                        type: object
                      recentActivity:
                        type: array
                        items:
                          type: object
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  
  /sales:
    get:
      summary: List sales
      description: Get all sales for tenant
      tags:
        - Sales
      security:
        - BearerAuth: []
      parameters:
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
        - name: stationId
          in: query
          schema:
            type: string
            format: uuid
        - name: paymentMethod
          in: query
          schema:
            type: string
            enum: [cash, card, upi, credit]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Sale'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    
    post:
      summary: Create sale
      description: Create a new sale
      tags:
        - Sales
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - nozzleId
                - quantity
                - pricePerUnit
                - paymentMethod
              properties:
                nozzleId:
                  type: string
                  format: uuid
                quantity:
                  type: number
                  format: float
                pricePerUnit:
                  type: number
                  format: float
                paymentMethod:
                  type: string
                  enum: [cash, card, upi, credit]
                creditorId:
                  type: string
                  format: uuid
      responses:
        '201':
          description: Sale created
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    $ref: '#/components/schemas/Sale'
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

## Login Credentials

| Role           | Email                  | Password    |
|----------------|------------------------|------------|
| Superadmin     | admin@fuelsync.com     | admin123   |
| Tenant Owner   | owner@demofuel.com     | password123 |
| Station Manager| manager@demofuel.com   | password123 |
| Employee       | employee@demofuel.com  | password123 |