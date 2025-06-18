// frontend/src/componentsdebug/AuthDebugger.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Divider, Alert } from '@mui/material';
import { getToken, parseToken, isTokenExpired, debugAuth } from '../utils/authHelper';

const AuthDebugger = () => {
  const [token, setToken] = useState('');
  const [parsedToken, setParsedToken] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [endpoint, setEndpoint] = useState('/api/auth/me');

  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
      setParsedToken(parseToken(storedToken));
    }
  }, []);

  const handleTestEndpoint = async () => {
    try {
      setApiResponse(null);
      setApiError(null);
      
      const storedToken = getToken();
      if (!storedToken) {
        setApiError('No token found in localStorage');
        return;
      }
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });
      
      const data = await response.json();
      setApiResponse(data);
      
      if (!response.ok) {
        setApiError(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('API test error:', error);
      setApiError(`Error: ${error.message}`);
    }
  };

  const handleDebugAuth = () => {
    debugAuth();
  };

  const handleClearToken = () => {
    localStorage.removeItem('token');
    setToken('');
    setParsedToken(null);
    setApiResponse(null);
    setApiError(null);
  };

  const isExpired = isTokenExpired();

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Authentication Debugger</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Token Status</Typography>
        {token ? (
          <>
            <Alert severity={isExpired ? "error" : "success"} sx={{ mb: 2 }}>
              Token is {isExpired ? "expired" : "valid"}
            </Alert>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
              <strong>Token:</strong> {token}
            </Typography>
          </>
        ) : (
          <Alert severity="warning">No token found in localStorage</Alert>
        )}
      </Box>
      
      {parsedToken && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Token Payload</Typography>
          <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto' }}>
            {JSON.stringify(parsedToken, null, 2)}
          </pre>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Test API Endpoint</Typography>
        <TextField
          fullWidth
          label="API Endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={handleTestEndpoint}
          disabled={!token}
          sx={{ mr: 1 }}
        >
          Test Endpoint
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleDebugAuth}
          sx={{ mr: 1 }}
        >
          Debug Auth
        </Button>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleClearToken}
        >
          Clear Token
        </Button>
      </Box>
      
      {apiResponse && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>API Response</Typography>
          <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto' }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </Box>
      )}
      
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}
    </Paper>
  );
};

export default AuthDebugger;