// frontend/src/pages/logout.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { removeUser } from '../utils/authHelper';

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call logout API
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }

      // Remove token regardless of API success
      removeUser();
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    };

    performLogout();
  }, [router]);

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
        Logging out...
      </Typography>
    </Box>
  );
};

export default LogoutPage;