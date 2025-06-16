import React, { ReactNode } from 'react';
import Image from 'next/image';
import { Box, Container, Paper, Typography } from '@mui/material';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ my: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
              FuelSync Hub
            </Typography>
          </Box>
          
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 2,
            }}
          >
            <Typography component="h2" variant="h5" gutterBottom textAlign="center">
              {title}
            </Typography>
            
            {children}
          </Paper>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
            &copy; {new Date().getFullYear()} FuelSync Hub. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;