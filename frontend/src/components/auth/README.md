# Authentication Components

This directory contains components for handling authentication and authorization in the FuelSync Hub frontend.

## Components

### ProtectedRoute

A higher-order component that protects routes that require authentication.

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Basic usage - requires any authenticated user
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// With role requirements - only allows users with specific roles
<ProtectedRoute allowedRoles={['owner', 'manager']}>
  <YourComponent />
</ProtectedRoute>

// For admin routes
<ProtectedRoute allowedRoles={['superadmin']} isAdminRoute={true}>
  <YourComponent />
</ProtectedRoute>
```

### NavigationGuard

A component that handles navigation based on authentication status. It redirects authenticated users from login/register pages to the dashboard.

This component is already included in `_app.tsx` and applies to all pages.

## Layout Wrappers

For convenience, we also provide authenticated layout wrappers:

### AuthenticatedDashboardLayout

```tsx
import AuthenticatedDashboardLayout from '@/components/layout/AuthenticatedDashboardLayout';

export default function YourPage() {
  return (
    <AuthenticatedDashboardLayout
      title="Your Page Title"
      allowedRoles={['owner', 'manager']}
    >
      {/* Your page content */}
    </AuthenticatedDashboardLayout>
  );
}
```

### AuthenticatedAdminLayout

```tsx
import AuthenticatedAdminLayout from '@/components/layout/AuthenticatedAdminLayout';

export default function YourAdminPage() {
  return (
    <AuthenticatedAdminLayout
      title="Your Admin Page Title"
      // Default role is 'superadmin', but you can override it
      allowedRoles={['superadmin']}
    >
      {/* Your admin page content */}
    </AuthenticatedAdminLayout>
  );
}
```

## Auth Utility

The `useAuth` hook provides authentication functionality:

```tsx
import { useAuth } from '@/utils/auth';

function YourComponent() {
  const { 
    user,        // Current user or null if not authenticated
    loading,     // True while checking authentication status
    isAdmin,     // Function to check if user is an admin
    hasRole,     // Function to check if user has a specific role
    login,       // Function to log in
    logout,      // Function to log out
    checkAuth    // Function to verify authentication status
  } = useAuth();

  // Example: Conditionally render based on role
  return (
    <div>
      {user && <p>Welcome, {user.email}!</p>}
      {hasRole('owner') && <AdminControls />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```