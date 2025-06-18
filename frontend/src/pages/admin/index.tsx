// frontend/src/pages/admin/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminToken) {
      // Redirect to dashboard if logged in
      router.push('/admin/dashboard');
    } else {
      // Redirect to login if not logged in
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Redirecting...
      </Typography>
    </Box>
  );
}