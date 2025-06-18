// frontend/src/components/auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { isAuthenticated, getUserRole } from '../../utils/authHelper';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['owner', 'manager', 'employee', 'superadmin'] 
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Skip auth check for login page
    if (router.pathname === '/login') {
      setLoading(false);
      setAuthorized(true);
      return;
    }

    // Check if user is authenticated
    const authenticated = isAuthenticated();
    if (!authenticated) {
      console.log('User not authenticated, redirecting to login...');
      router.push('/login');
      return;
    }

    // Check if user has required role
    const userRole = getUserRole();
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log(`User role ${userRole} not allowed, redirecting to login...`);
      router.push('/login');
      return;
    }

    // User is authenticated and authorized
    setAuthorized(true);
    setLoading(false);
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return authorized ? <>{children}</> : null;
};

export default ProtectedRoute;