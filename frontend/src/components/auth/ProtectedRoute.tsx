import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/auth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  isAdminRoute?: boolean;
}

/**
 * Higher-order component to protect routes that require authentication
 */
export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  isAdminRoute = false 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, hasRole } = useAuth(isAdminRoute);

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.replace(isAdminRoute ? '/admin/login' : '/login');
      return;
    }

    // If user exists and roles are specified, check if user has required role
    if (!loading && user && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      
      if (!hasRequiredRole) {
        // Redirect to dashboard if user doesn't have required role
        router.replace(isAdminRoute ? '/admin/dashboard' : '/dashboard');
      }
    }
  }, [loading, user, router, requiredRoles, hasRole, isAdminRoute]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not loading and no user, don't render children (will redirect)
  if (!loading && !user) {
    return null;
  }

  // If roles are specified and user doesn't have required role, don't render children
  if (!loading && user && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return null;
    }
  }

  // If all checks pass, render children
  return <>{children}</>;
}