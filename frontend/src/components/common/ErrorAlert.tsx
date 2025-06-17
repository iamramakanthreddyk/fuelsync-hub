import React from 'react';
import { Alert, AlertTitle, Collapse } from '@mui/material';
import { formatErrorMessage } from '../../utils/errorHandler';

interface ErrorAlertProps {
  error: unknown | null;
  onClose?: () => void;
  severity?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
}

/**
 * A reusable error alert component that formats error messages
 */
export default function ErrorAlert({ 
  error, 
  onClose, 
  severity = 'error',
  title
}: ErrorAlertProps) {
  if (!error) return null;
  
  const message = formatErrorMessage(error);
  
  return (
    <Collapse in={!!error}>
      <Alert 
        severity={severity} 
        onClose={onClose}
        sx={{ mb: 2 }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Collapse>
  );
}