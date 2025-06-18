# FuelSync Hub - Testing Guide

This guide provides step-by-step instructions for testing the FuelSync Hub platform, including superadmin, tenant owner, manager, and employee roles.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Backend and frontend servers running

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd fuelsync-hub
   npm install
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations and seed data:
   ```bash
   npm run db:setup
   ```
   
   If you encounter any issues, you can run the comprehensive seed script:
   ```bash
   npm run db:seed-all
   ```
   
   Or run the seed scripts individually:
   ```bash
   npm run db:seed-admin
   npm run db:seed-tenant-users
   npm run db:seed-credit
   ```

## Testing Credentials

| Role           | Email                  | Password    |
|----------------|------------------------|------------|
| Superadmin     | admin@fuelsync.com     | admin123   |
| Tenant Owner   | owner@demofuel.com     | password123 |
| Station Manager| manager@demofuel.com   | password123 |
| Employee       | employee@demofuel.com  | password123 |

## Quick Test

To quickly verify that all user logins are working:

```bash
cd backend
node test-tenant-login.js
```

This script will attempt to log in with each user type and display the results.

## Testing Superadmin Functionality

### Step 1: Login as Superadmin

1. Navigate to `/admin/login`
2. Enter credentials:
   - Email: `admin@fuelsync.com`
   - Password: `admin123`
3. Click "Sign In"
4. Verify you are redirected to the admin dashboard

### Step 2: Test Dashboard

1. Verify dashboard displays key metrics:
   - Total tenants
   - Total users
   - Total stations
   - System health indicators
2. Verify recent activity is displayed
3. Check that all dashboard widgets load correctly

### Step 3: Test Tenant Management

1. Click on "Tenants" in the sidebar
2. Verify tenant list loads correctly
3. Test creating a new tenant:
   - Click "Add Tenant"
   - Fill in required fields:
     - Name: `Test Tenant`
     - Email: `test-tenant@example.com`
     - Contact Person: `Test Contact`
     - Contact Phone: `555-5555`
     - Subscription Plan: `Basic`
   - Click "Create Tenant"
   - Verify tenant is added to the list
4. Test editing a tenant:
   - Find the tenant you created
   - Click the "Edit" button
   - Change the name to `Updated Test Tenant`
   - Click "Save Changes"
   - Verify changes are saved
5. Test deleting a tenant:
   - Find the tenant you created
   - Click the "Delete" button
   - Confirm deletion
   - Verify tenant is removed from the list

### Step 4: Test User Management

1. Click on "Users" in the sidebar
2. Verify user list loads correctly
3. Test creating a new user:
   - Click "Add User"
   - Fill in required fields:
     - Email: `test-user@example.com`
     - Password: `password123`
     - First Name: `Test`
     - Last Name: `User`
     - Role: `manager`
     - Tenant: Select an existing tenant
   - Click "Create User"
   - Verify user is added to the list
4. Test editing a user:
   - Find the user you created
   - Click the "Edit" button
   - Change the first name to `Updated`
   - Click "Save Changes"
   - Verify changes are saved
5. Test deleting a user:
   - Find the user you created
   - Click the "Delete" button
   - Confirm deletion
   - Verify user is removed from the list

### Step 5: Test Station Management

1. Click on "Stations" in the sidebar
2. Verify station list loads correctly
3. Test creating a new station:
   - Click "Add Station"
   - Fill in required fields:
     - Name: `Test Station`
     - Address: `123 Test St`
     - City: `Test City`
     - State: `TS`
     - ZIP: `12345`
     - Contact Phone: `555-5555`
     - Tenant: Select an existing tenant
   - Click "Create Station"
   - Verify station is added to the list
4. Test editing a station:
   - Find the station you created
   - Click the "Edit" button
   - Change the name to `Updated Test Station`
   - Click "Save Changes"
   - Verify changes are saved
5. Test deleting a station:
   - Find the station you created
   - Click the "Delete" button
   - Confirm deletion
   - Verify station is removed from the list

### Step 6: Test Reports

1. Click on "Reports" in the sidebar
2. Test Sales Report:
   - Click on "Sales Report"
   - Set date range and filters
   - Click "Generate Report"
   - Verify report displays correctly
3. Test Credit Report:
   - Click on "Credit Report"
   - Set date range and filters
   - Click "Generate Report"
   - Verify report displays correctly
4. Test Compliance Report:
   - Click on "Compliance Report"
   - Select a tenant (optional)
   - Click "Generate Report"
   - Verify report displays correctly

### Step 7: Test Settings

1. Click on "Settings" in the sidebar
2. Verify settings page loads correctly
3. Test updating tenant subscription limits:
   - Change limits for Basic plan
   - Click "Save Settings"
   - Verify changes are saved
4. Test system maintenance settings:
   - Toggle maintenance mode
   - Update maintenance message
   - Click "Save Settings"
   - Verify changes are saved

## Testing Tenant Owner Functionality

### Step 1: Login as Tenant Owner

1. Navigate to `/login`
2. Enter credentials:
   - Email: `owner@demofuel.com`
   - Password: `password123`
3. Click "Sign In"
4. Verify you are redirected to the tenant dashboard

### Step 2: Test Dashboard

1. Verify dashboard displays key metrics:
   - Sales summary
   - Inventory levels
   - Recent activity
2. Check that all dashboard widgets load correctly

### Step 3: Test User Management

1. Click on "Users" in the sidebar
2. Verify user list loads correctly
3. Test creating a new user:
   - Click "Add User"
   - Fill in required fields:
     - Email: `new-employee@example.com`
     - Password: `password123`
     - First Name: `New`
     - Last Name: `Employee`
     - Role: `employee`
   - Click "Create User"
   - Verify user is added to the list
4. Test editing a user:
   - Find the user you created
   - Click the "Edit" button
   - Change the first name to `Updated`
   - Click "Save Changes"
   - Verify changes are saved
5. Test deleting a user:
   - Find the user you created
   - Click the "Delete" button
   - Confirm deletion
   - Verify user is removed from the list

### Step 4: Test Station Management

1. Click on "Stations" in the sidebar
2. Verify station list loads correctly
3. Test creating a new station:
   - Click "Add Station"
   - Fill in required fields:
     - Name: `New Station`
     - Address: `456 New St`
     - City: `New City`
     - State: `NS`
     - ZIP: `67890`
     - Contact Phone: `555-6789`
   - Click "Create Station"
   - Verify station is added to the list
4. Test editing a station:
   - Find the station you created
   - Click the "Edit" button
   - Change the name to `Updated New Station`
   - Click "Save Changes"
   - Verify changes are saved
5. Test deleting a station:
   - Find the station you created
   - Click the "Delete" button
   - Confirm deletion
   - Verify station is removed from the list

### Step 5: Test Reports

1. Click on "Reports" in the sidebar
2. Test Sales Report:
   - Click on "Sales Report"
   - Set date range and filters
   - Click "Generate Report"
   - Verify report displays correctly
3. Test Inventory Report:
   - Click on "Inventory Report"
   - Set date range and filters
   - Click "Generate Report"
   - Verify report displays correctly
4. Test Credit Report:
   - Click on "Credit Report"
   - Set date range and filters
   - Click "Generate Report"
   - Verify report displays correctly

## Testing Station Manager Functionality

### Step 1: Login as Station Manager

1. Navigate to `/login`
2. Enter credentials:
   - Email: `manager@demofuel.com`
   - Password: `password123`
3. Click "Sign In"
4. Verify you are redirected to the station dashboard

### Step 2: Test Dashboard

1. Verify dashboard displays key metrics:
   - Daily sales
   - Inventory levels
   - Recent transactions
2. Check that all dashboard widgets load correctly

### Step 3: Test Sales Management

1. Click on "Sales" in the sidebar
2. Verify sales list loads correctly
3. Test creating a new sale:
   - Click "New Sale"
   - Fill in required fields:
     - Pump/Nozzle: Select from dropdown
     - Quantity: `20`
     - Price per Unit: `4.50`
     - Payment Method: `cash`
   - Click "Record Sale"
   - Verify sale is added to the list
4. Test viewing sale details:
   - Click on a sale in the list
   - Verify details are displayed correctly

### Step 4: Test Inventory Management

1. Click on "Inventory" in the sidebar
2. Verify inventory levels are displayed correctly
3. Test recording a delivery:
   - Click "Record Delivery"
   - Fill in required fields:
     - Fuel Type: `petrol`
     - Quantity: `1000`
     - Supplier: `Test Supplier`
     - Invoice Number: `INV-12345`
   - Click "Record Delivery"
   - Verify inventory levels are updated

### Step 5: Test Reports

1. Click on "Reports" in the sidebar
2. Test Station Sales Report:
   - Click on "Sales Report"
   - Set date range
   - Click "Generate Report"
   - Verify report displays correctly
3. Test Shift Report:
   - Click on "Shift Report"
   - Set date range
   - Click "Generate Report"
   - Verify report displays correctly

## Testing Employee Functionality

### Step 1: Login as Employee

1. Navigate to `/login`
2. Enter credentials:
   - Email: `employee@demofuel.com`
   - Password: `password123`
3. Click "Sign In"
4. Verify you are redirected to the sales screen

### Step 2: Test Sales Recording

1. Verify sales form is displayed
2. Test recording a sale:
   - Select Pump/Nozzle from dropdown
   - Enter Quantity: `15`
   - Enter Price per Unit: `4.50`
   - Select Payment Method: `card`
   - Click "Record Sale"
   - Verify sale is recorded successfully
3. Verify recent transactions are displayed

### Step 3: Test Shift Management

1. Click on "Shifts" in the sidebar
2. Test starting a shift:
   - Click "Start Shift"
   - Enter starting cash amount: `100`
   - Click "Start"
   - Verify shift is started
3. Test ending a shift:
   - Click "End Shift"
   - Enter ending cash amount: `250`
   - Click "End"
   - Verify shift is ended and report is generated

## Troubleshooting Common Issues

### Issue: Unable to Login with Tenant Users

**Solution**:
1. Run the comprehensive seed script:
   ```bash
   npm run db:seed-all
   ```
2. Verify the users exist in the database:
   ```sql
   SELECT * FROM users WHERE email IN ('owner@demofuel.com', 'manager@demofuel.com', 'employee@demofuel.com');
   ```
3. Test the login with the test script:
   ```bash
   node test-tenant-login.js
   ```

### Issue: Database Schema Errors in Seed Scripts

**Solution**:
1. Check the actual database schema:
   ```bash
   ts-node -e "import { Pool } from 'pg'; import dotenv from 'dotenv'; import path from 'path'; dotenv.config({ path: path.resolve(__dirname, '.env') }); const pool = new Pool({ host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT || '5432'), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, ssl: { rejectUnauthorized: false } }); async function checkSchema() { try { const client = await pool.connect(); try { const result = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'TABLE_NAME\' ORDER BY ordinal_position'); console.log('TABLE_NAME columns:'); result.rows.forEach(row => console.log(row.column_name)); } finally { client.release(); } await pool.end(); } catch (err) { console.error('Error:', err); } } checkSchema();"
   ```
   Replace `TABLE_NAME` with the name of the table you want to check.

2. Update the seed scripts to match the actual schema.

### Issue: Unable to Edit Tenants

**Solution**:
1. Check the tenant edit form submission handler
2. Verify the API endpoint is correct
3. Check for proper error handling
4. Ensure the tenant ID is correctly passed to the API

### Issue: Dashboard Routing Problems

**Solution**:
1. Check the URL structure in the router
2. Ensure links use the correct path format
3. Update links to use the correct prefix (`/admin/` for admin routes)
4. Verify route definitions in the Next.js router

### Issue: Unable to Create Tenants/Users

**Solution**:
1. Check form validation logic
2. Verify API endpoints are correct
3. Ensure all required fields are included in the request
4. Check server logs for specific error messages

### Issue: Owner Dropdown in User Creation

**Solution**:
1. The owner dropdown should only appear when creating users as a superadmin
2. When creating users as a tenant owner, the tenant should be automatically set
3. Update the user creation form to conditionally show fields based on the current user's role

### Issue: Missing Credit Reports

**Solution**:
1. Run the credit sales seed script:
   ```bash
   npm run db:seed-credit
   ```
2. Verify credit sales exist in the database:
   ```sql
   SELECT * FROM sales WHERE payment_method = 'credit';
   ```
3. Check the credit report query to ensure it's filtering correctly

## Verifying Database Setup

To verify the database is properly set up with seed data:

```bash
# Connect to the database
psql -U your_username -d fuelsync_db

# List tenants
SELECT * FROM tenants;

# List users
SELECT * FROM users;

# List stations
SELECT * FROM stations;

# List sales
SELECT * FROM sales;

# List credit sales
SELECT * FROM sales WHERE payment_method = 'credit';
```