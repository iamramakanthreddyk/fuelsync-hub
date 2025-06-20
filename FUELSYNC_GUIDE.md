# FuelSync Hub - Complete Guide

This document provides a comprehensive guide for FuelSync Hub, including database schema, seeding data, testing, and troubleshooting common issues.

## Database Schema

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|-----------|
| `tenants` | Tenant companies | id, name, email, subscription_plan |
| `users` | User accounts | id, email, password_hash, role, tenant_id |
| `stations` | Fuel stations | id, name, address, tenant_id |
| `pumps` | Fuel pumps | id, name, station_id |
| `nozzles` | Pump nozzles | id, pump_id, fuel_type |
| `sales` | Sales transactions | id, nozzle_id, user_id, amount |
| `creditors` | Credit customers | id, party_name, credit_limit |
| `credit_payments` | Credit payments | id, creditor_id, amount |

### Important Notes

- The `sales.amount` column is **generated** from `sale_volume` and `fuel_price`
- User roles are: `superadmin`, `owner`, `manager`, `employee`
- Payment methods are: `cash`, `card`, `upi`, `credit`

## Setup and Seeding

### Quick Setup

To set up the database and seed all necessary data:

```bash
npm run db:setup
```

### Seeding Specific Data

1. **Admin User**:
   ```bash
   npm run db:seed-admin
   ```

2. **Tenant Users**:
   ```bash
   npm run db:seed-tenant-users
   ```

3. **Credit Sales Data**:
   ```bash
   npm run db:seed-simple
   ```

### Verifying Data

To verify the seed data was created correctly:

```bash
npm run db:verify-seed
```

### Checking and Fixing Station Relationships

To check and fix station-tenant-user relationships:

```bash
npm run db:check-stations
```

## Login Credentials

### Admin

| Role | Email | Password |
|------|-------|----------|
| Superadmin | admin@fuelsync.com | admin123 |

### Tenant Users

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@demofuel.com | password123 |
| Manager | manager@demofuel.com | password123 |
| Employee | employee@demofuel.com | password123 |

## Critical Issues and Fixes

### "stations.map is not a function" Error

**Issue**: Components fail with `stations.map is not a function` error

**Fix**:
1. Use the fixed StationSelector component that includes defensive checks:
```jsx
// frontend/src/components/common/StationSelector.jsx
// This component includes proper error handling and defensive checks
```

2. Access the debug page to diagnose API issues:
```
http://localhost:3000/debug
```

3. Check the browser console for detailed error messages

### Authentication Issues

**Issue**: API calls fail with `INVALID_AUTH_HEADER` error

**Fix**:
1. Use the authHelper.js utility for consistent token handling:
```javascript
import { getToken, authHeader } from '../utils/authHelper';

// When making API calls
fetch('/api/endpoint', {
  headers: authHeader()
});
```

2. Check token format in the debug page
3. Ensure the token is properly stored after login

### Station-Tenant-User Relationship Issues

**Issue**: Users can't access stations they should have access to

**Fix**:
1. Run the station relationship check and fix script:
```bash
npm run db:check-stations
```

2. Verify that users are properly assigned to stations in the database

## Debugging Tools

### Debug Page

Access the debug page to diagnose issues:
```
http://localhost:3000/debug
```

This page provides:
- API testing with custom endpoints
- Token inspection
- StationSelector component testing

### Browser Console Debugging

Add these lines to your components for better debugging:

```javascript
// Debug API calls
console.log('API Request:', { url, headers, body });
console.log('API Response:', data);

// Debug component props and state
console.log('Component Props:', props);
console.log('Component State:', { stations, loading, error });
```

## Testing Guide

### Testing Superadmin

1. Login as superadmin: `admin@fuelsync.com` / `admin123`
2. Test tenant management (create, edit, delete)
3. Test user management (create, edit, delete)
4. Test station management (create, edit, delete)
5. Test reports (sales, credit, compliance)

### Testing Tenant Owner

1. Login as owner: `owner@demofuel.com` / `password123`
2. Test dashboard metrics
3. Test user management within tenant
4. Test station management within tenant
5. Test reports (sales, inventory, credit)

### Testing Station Manager

1. Login as manager: `manager@demofuel.com` / `password123`
2. Test dashboard metrics
3. Test sales management
4. Test inventory management
5. Test reports (sales, shift)

### Testing Employee

1. Login as employee: `employee@demofuel.com` / `password123`
2. Test sales recording
3. Test shift management

## Troubleshooting

### Database Issues

1. **Check Schema**:
   ```bash
   npm run db:check-sales
   npm run db:check-creditors
   npm run db:check-payments
   ```

2. **Reset Database**:
   ```bash
   npm run db:reset
   ```

### Authentication Issues

1. **Test Login**:
   ```bash
   node test-tenant-login.js
   ```

2. **Check Token**:
   Open browser console and check:
   ```javascript
   console.log(localStorage.getItem('token'));
   ```

3. **Verify JWT**:
   Paste token at [jwt.io](https://jwt.io) to check payload

### API Issues

1. **Check API Endpoints**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/endpoint
   ```

2. **Check Server Logs**:
   ```bash
   npm run dev
   ```

3. **Test Stations API**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/stations
   ```

## Frontend Debugging

### Debugging React Components

1. Add console logs to component lifecycle methods:
```jsx
useEffect(() => {
  console.log('Component mounted');
  console.log('Initial stations:', stations);
  
  fetchStations()
    .then(data => {
      console.log('Fetched stations:', data);
      setStations(data);
    })
    .catch(err => console.error('Error fetching stations:', err));
}, []);
```

2. Check for null/undefined before mapping:
```jsx
{stations ? (
  Array.isArray(stations) ? (
    stations.map((station) => (
      <MenuItem key={station.id} value={station.id}>
        {station.name}
      </MenuItem>
    ))
  ) : (
    <MenuItem>No stations available (not an array)</MenuItem>
  )
) : (
  <MenuItem>Loading stations...</MenuItem>
)}
```

3. Add error boundaries to catch rendering errors:
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    console.error('Component error:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <StationSelector />
</ErrorBoundary>
```

## Development Tips

### Adding New Features

1. **Check Schema First**: Always check the database schema before making changes
2. **Test with Minimal Data**: Use the simple seed script for testing
3. **Verify Changes**: Use the verify script to check your changes

### Common Pitfalls

1. **Generated Columns**: Don't include generated columns in INSERT statements
2. **Role-Based Access**: Ensure proper role checks for all routes
3. **Token Handling**: Always include the token in API requests
4. **Array Checks**: Always check if data is an array before using array methods

## Next Steps

1. Fix the stations.map error by using the fixed StationSelector component
2. Fix authentication issues by using the authHelper.js utility
3. Verify station-tenant-user relationships with the check-stations script
4. Use the debug page to diagnose API and authentication issues
5. Add defensive checks to all components that use array methods