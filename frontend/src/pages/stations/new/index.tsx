// frontend/src/pages/stations/new/index.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { authHeader } from '../../../utils/authHelper';

const NewStationPage = () => {
  const router = useRouter();
  const [station, setStation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contact_phone: '',
    active: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setStation(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      const headers = authHeader();
      if (!headers.Authorization) {
        setError('Authentication required');
        setSaving(false);
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/stations', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(station)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create station');
      }
      
      const data = await response.json();
      console.log('Created station:', data);
      
      router.push('/stations');
    } catch (err) {
      console.error('Error creating station:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/stations');
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="New Station">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" alignItems="center" mb={4}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleCancel}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              Add New Station
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Paper sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Station Name"
                    name="name"
                    value={station.name}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={station.address}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={station.city}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={station.state}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zip"
                    value={station.zip}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    name="contact_phone"
                    value={station.contact_phone}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={station.active}
                        onChange={handleSwitchChange}
                        name="active"
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={24} /> : 'Create Station'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NewStationPage;