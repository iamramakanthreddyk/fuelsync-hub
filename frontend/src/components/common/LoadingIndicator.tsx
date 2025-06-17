import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingIndicatorProps {
  message?: string;
  fullHeight?: boolean;
}

/**
 * A reusable loading indicator component
 */
export default function LoadingIndicator({ 
  message = 'Loading...', 
  fullHeight = false 
}: LoadingIndicatorProps) {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      height={fullHeight ? '100vh' : '200px'}
      width="100%"
    >
      <CircularProgress size={40} />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}