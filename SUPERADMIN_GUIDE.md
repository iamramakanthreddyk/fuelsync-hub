# FuelSync Hub - Superadmin User Guide

This guide provides comprehensive instructions for superadmins on how to use the FuelSync Hub administration portal.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard](#dashboard)
4. [Tenant Management](#tenant-management)
5. [User Management](#user-management)
6. [Station Management](#station-management)
7. [Reports](#reports)
8. [System Settings](#system-settings)
9. [Troubleshooting](#troubleshooting)

## Introduction

FuelSync Hub is a multi-tenant SaaS platform for fuel station management. As a superadmin, you have access to all tenants, users, and stations across the platform. You can manage tenant subscriptions, monitor system health, and enforce business rules.

### Key Responsibilities

- Managing tenant accounts and subscriptions
- Monitoring system health and performance
- Generating and analyzing reports
- Configuring system-wide settings
- Enforcing business rules and compliance

## Getting Started

### Accessing the Admin Portal

1. Navigate to the admin login page: `/admin/login`
2. Enter your superadmin credentials:
   - Email: `admin@fuelsync.com` (default)
   - Password: Your assigned password
3. Click "Sign In"

### Navigation

The admin portal has a sidebar navigation menu with the following sections:

- **Dashboard**: Overview of system statistics and recent activity
- **Tenants**: Manage tenant accounts
- **Users**: Manage users across all tenants
- **Reports**: Access sales, credit, and compliance reports
- **Settings**: Configure system-wide settings

## Dashboard

The dashboard provides a quick overview of the system status and recent activity.

### Key Metrics

- **Total Tenants**: Number of active tenant accounts
- **Total Users**: Number of users across all tenants
- **Total Stations**: Number of fuel stations across all tenants
- **System Health**: Current status of system components

### Recent Activity

The recent activity section shows the latest actions performed by admins and users, including:

- Tenant creations and updates
- User logins and logouts
- Station configurations
- System setting changes

## Tenant Management

The tenant management section allows you to create, view, update, and delete tenant accounts.

### Viewing Tenants

1. Click on "Tenants" in the sidebar
2. View the list of all tenants with key information:
   - Name
   - Email
   - Subscription Plan
   - Status
   - Creation Date

### Creating a Tenant

1. Click on "Tenants" in the sidebar
2. Click the "Add Tenant" button
3. Fill in the required information:
   - Name
   - Email
   - Contact Person
   - Contact Phone
   - Subscription Plan (Basic, Premium, Enterprise)
4. Click "Create Tenant"

### Editing a Tenant

1. Click on "Tenants" in the sidebar
2. Find the tenant you want to edit
3. Click the "Edit" button
4. Update the tenant information
5. Click "Save Changes"

### Deleting a Tenant

1. Click on "Tenants" in the sidebar
2. Find the tenant you want to delete
3. Click the "Delete" button
4. Confirm the deletion

## User Management

The user management section allows you to manage users across all tenants.

### Viewing Users

1. Click on "Users" in the sidebar
2. View the list of all users with key information:
   - Name
   - Email
   - Role
   - Tenant
   - Status
   - Creation Date

### Creating a User

1. Click on "Users" in the sidebar
2. Click the "Add User" button
3. Fill in the required information:
   - First Name
   - Last Name
   - Email
   - Password
   - Role (Owner, Manager, Employee)
   - Tenant
4. Click "Create User"

### Editing a User

1. Click on "Users" in the sidebar
2. Find the user you want to edit
3. Click the "Edit" button
4. Update the user information
5. Click "Save Changes"

### Deleting a User

1. Click on "Users" in the sidebar
2. Find the user you want to delete
3. Click the "Delete" button
4. Confirm the deletion

## Station Management

The station management section allows you to manage fuel stations across all tenants.

### Viewing Stations

1. Click on "Stations" in the sidebar
2. View the list of all stations with key information:
   - Name
   - Address
   - Tenant
   - Status
   - Creation Date

### Creating a Station

1. Click on "Stations" in the sidebar
2. Click the "Add Station" button
3. Fill in the required information:
   - Name
   - Address
   - City
   - State
   - ZIP
   - Contact Phone
   - Tenant
4. Click "Create Station"

### Editing a Station

1. Click on "Stations" in the sidebar
2. Find the station you want to edit
3. Click the "Edit" button
4. Update the station information
5. Click "Save Changes"

### Deleting a Station

1. Click on "Stations" in the sidebar
2. Find the station you want to delete
3. Click the "Delete" button
4. Confirm the deletion

## Reports

The reports section provides insights into sales, credits, and compliance across the platform.

### Sales Report

The sales report shows sales data across tenants and stations.

1. Click on "Reports" in the sidebar
2. Click on "Sales Report"
3. Set the filters:
   - Date Range
   - Tenant (optional)
   - Station (optional)
4. Click "Generate Report"
5. View the report with the following sections:
   - Summary: Total sales, transactions, and average transaction value
   - Payment Methods: Sales breakdown by payment method
   - Fuel Types: Sales breakdown by fuel type
   - Detailed Sales: Day-by-day sales data

### Credit Report

The credit report shows credit sales and outstanding balances.

1. Click on "Reports" in the sidebar
2. Click on "Credit Report"
3. Set the filters:
   - Date Range
   - Tenant (optional)
   - Station (optional)
4. Click "Generate Report"
5. View the report with the following sections:
   - Summary: Total credit, outstanding credit, paid credit, and payment rate
   - Credit Details: Breakdown by creditor

### Compliance Report

The compliance report shows tenant compliance with business rules.

1. Click on "Reports" in the sidebar
2. Click on "Compliance Report"
3. Set the filters:
   - Tenant (optional)
4. Click "Generate Report"
5. View the report with the following sections:
   - Summary: Overall compliance score, compliant tenants, and non-compliant tenants
   - Tenant Compliance Details: Compliance score, status, and issues for each tenant

## System Settings

The system settings section allows you to configure system-wide parameters.

### Tenant Subscription Limits

1. Click on "Settings" in the sidebar
2. Scroll to the "Tenant Subscription Limits" section
3. Configure limits for each subscription plan:
   - Basic Plan: Maximum stations and users
   - Premium Plan: Maximum stations and users
   - Enterprise Plan: Maximum stations and users (use -1 for unlimited)
4. Click "Save Settings"

### System Maintenance

1. Click on "Settings" in the sidebar
2. Scroll to the "System Maintenance" section
3. Configure maintenance settings:
   - Maintenance Mode: Enable/disable
   - Maintenance Message: Message to display during maintenance
   - Allowed IPs: IPs that can access the system during maintenance
4. Click "Save Settings"

## Troubleshooting

### Common Issues

#### Login Issues

- **Problem**: Unable to log in
- **Solution**: 
  1. Verify your email and password
  2. Check if your account is active
  3. Clear browser cache and cookies
  4. Contact system administrator if the issue persists

#### Report Generation Issues

- **Problem**: Reports take too long to generate
- **Solution**:
  1. Narrow down the date range
  2. Filter by specific tenant or station
  3. Try again during off-peak hours

#### System Maintenance Mode

- **Problem**: Users cannot access the system during maintenance
- **Solution**:
  1. Add your IP to the allowed IPs list
  2. Disable maintenance mode when not needed
  3. Schedule maintenance during off-peak hours

### Support

For additional support, please contact the system administrator at `support@fuelsync.com`.

---

© 2025 FuelSync Hub. All rights reserved.