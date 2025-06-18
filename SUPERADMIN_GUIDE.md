# Superadmin Guide for FuelSync Hub

## Overview

The superadmin role in FuelSync Hub is responsible for managing the entire platform, including tenants, users, and system settings. This guide explains the superadmin workflow and features.

## Superadmin vs Tenant Users

| Feature | Superadmin | Tenant Users |
|---------|------------|--------------|
| Access | Admin portal | Tenant portal |
| Authentication | Separate admin login | Tenant-specific login |
| Database | Public schema | Tenant-specific schema |
| Role | Platform management | Fuel station management |

## Superadmin Workflow

### 1. Authentication

1. Navigate to `/admin/login`
2. Enter superadmin credentials:
   - Email: `admin@fuelsync.com`
   - Password: `admin123` (change this in production)
3. Upon successful login, you'll be redirected to the admin dashboard

### 2. Dashboard

The admin dashboard provides an overview of the platform:

- Total number of tenants
- Total number of users
- Total number of stations
- Recent tenant registrations

### 3. Tenant Management

Superadmins can manage tenants through the Tenants page:

- **View Tenants**: See a list of all tenants with their details
- **Create Tenant**: Add a new tenant with subscription plan
- **Edit Tenant**: Modify tenant details and subscription plan
- **Delete Tenant**: Remove a tenant from the platform
- **View Tenant Details**: See detailed information about a specific tenant

### 4. User Management

Superadmins can manage users across all tenants:

- **View Users**: See a list of all users with their details
- **Create User**: Add a new user to a tenant
- **Edit User**: Modify user details and roles
- **Delete User**: Remove a user from the platform

### 5. System Settings

Superadmins can configure system-wide settings:

- **Subscription Plans**: Configure limits for different subscription plans
- **System Maintenance**: Enable/disable maintenance mode
- **Email Templates**: Manage email templates for notifications
- **API Keys**: Manage API keys for external integrations

## Database Schema

The superadmin functionality uses the following tables in the public schema:

- `admin_users`: Stores superadmin user information
- `admin_activity_logs`: Logs all superadmin activities
- `admin_sessions`: Manages superadmin login sessions
- `admin_settings`: Stores system-wide settings
- `admin_notifications`: Manages notifications for superadmins

## Setting Up Superadmin

To set up the superadmin functionality:

1. Run the admin schema setup:
   ```bash
   npm run db:admin
   ```

2. This will create the necessary tables and insert a default superadmin user:
   - Email: `admin@fuelsync.com`
   - Password: `admin123`

3. For security, change the default password after first login

## API Endpoints

The superadmin API endpoints are prefixed with `/api/admin`:

- **Authentication**:
  - `POST /api/admin/auth/login`: Login as superadmin
  - `POST /api/admin/auth/logout`: Logout superadmin session

- **Dashboard**:
  - `GET /api/admin/dashboard`: Get dashboard statistics

- **Tenants**:
  - `GET /api/admin/tenants`: Get all tenants
  - `POST /api/admin/tenants`: Create a new tenant
  - `GET /api/admin/tenants/:id`: Get tenant details
  - `PUT /api/admin/tenants/:id`: Update tenant details
  - `DELETE /api/admin/tenants/:id`: Delete a tenant

- **Users**:
  - `GET /api/admin/users`: Get all users
  - `POST /api/admin/users`: Create a new user
  - `GET /api/admin/users/:id`: Get user details
  - `PUT /api/admin/users/:id`: Update user details
  - `DELETE /api/admin/users/:id`: Delete a user

- **Settings**:
  - `GET /api/admin/settings`: Get all settings
  - `PUT /api/admin/settings/:key`: Update a setting

## Security Considerations

1. **Separate Authentication**: Superadmin authentication is completely separate from tenant user authentication
2. **JWT Tokens**: Different JWT secrets and expiration times for superadmin tokens
3. **Activity Logging**: All superadmin actions are logged for audit purposes
4. **IP Restrictions**: Optional IP-based restrictions for superadmin access
5. **Rate Limiting**: Strict rate limiting on admin API endpoints

## Troubleshooting

### Login Issues

If you can't log in as superadmin:

1. Verify the admin_users table exists:
   ```sql
   SELECT * FROM admin_users;
   ```

2. Reset the superadmin password:
   ```sql
   UPDATE admin_users 
   SET password_hash = '$2b$10$1XkNzy.KxQq5PCYzqH7f5OzR.kxUBqY5RHPz1InmKCDPZKX9YX9Vy' 
   WHERE email = 'admin@fuelsync.com';
   ```

### Missing Tables

If admin tables are missing:

1. Run the admin schema setup:
   ```bash
   npm run db:admin
   ```

### API Errors

If you encounter API errors:

1. Check the server logs for detailed error messages
2. Verify the JWT token is valid and not expired
3. Check if the superadmin user is active in the database