// frontend/src/pages/debug.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Divider, 
  Alert,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import StationSelector from '../components/common/StationSelector';

// Import the AuthDebugger component if it exists
let AuthDebugger;
try {
  AuthDebugger = require('../componentsdebug/AuthDebugger').default;
} catch (error) {
  console.error('AuthDebugger component not found:', error);
}

const DebugPage = () => {
  const [token, setToken] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [endpoint, setEndpoint] = useState('/api/stations');
  const [selectedStation, setSelectedStation] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleTestEndpoint = async () => {
    try {
      setApiResponse(null);
      setApiError(null);
      
      if (!token) {
        setApiError('No token provided');
        return;
      }
      
      console.log(`Testing endpoint: ${endpoint}`);
      console.log(`Using token: ${token.substring(0, 20)}...`);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('API response:', data);
      setApiResponse(data);
      
      if (!response.ok) {
        setApiError(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('API test error:', error);
      setApiError(`Error: ${error.message}`);
    }
  };

  const handleStationChange = (event) => {
    setSelectedStation(event.target.value);
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  };

  const parsedToken = token ? parseJwt(token) : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Debug Tools</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="API Tester" />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="JWT Token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                
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
                  color="error" 
                  onClick={() => {
                    localStorage.removeItem('token');
                    setToken('');
                  }}
                >
                  Clear Token
                </Button>
              </Box>
              
              {apiResponse && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>API Response</Typography>
                  <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </Box>
              )}
              
              {apiError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {apiError}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Token Information" />
            <CardContent>
              {token ? (
                <>
                  <Typography variant="subtitle2" gutterBottom>Token Payload:</Typography>
                  <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
                    {JSON.stringify(parsedToken, null, 2)}
                  </pre>
                  
                  {parsedToken && (
                    <List dense>
                      <ListItem>
                        <ListItemText primary="User ID" secondary={parsedToken.id || parsedToken.sub || 'Not found'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Role" secondary={parsedToken.role || 'Not found'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Expiration" 
                          secondary={
                            parsedToken.exp 
                              ? new Date(parsedToken.exp * 1000).toLocaleString() 
                              : 'Not found'
                          } 
                        />
                      </ListItem>
                    </List>
                  )}
                </>
              ) : (
                <Alert severity="warning">No token provided</Alert>
              )}
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader title="StationSelector Test" />
            <CardContent>
              <StationSelector 
                value={selectedStation}
                onChange={handleStationChange}
              />
              
              {selectedStation && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Selected station ID: {selectedStation}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {AuthDebugger && (
        <Box sx={{ mt: 3 }}>
          <AuthDebugger />
        </Box>
      )}
    </Container>
  );
};

export default DebugPage;