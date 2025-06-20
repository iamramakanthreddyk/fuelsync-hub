// frontend/src/pages/stations/[id]/edit/index.tsx
import React, { useState, useEffect } from 'react';
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
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import { authHeader } from '../../../../utils/authHelper';
import { apiFetch } from '../../../../services/api';

const StationEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [station, setStation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contact_phone: '',
    active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchStationData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const headers = authHeader();
        if (!headers.Authorization) {
          setError('Authentication required');
          setLoading(false);
          router.push('/login');
          return;
        }
        
        const response = await apiFetch(`/stations/${id}`, {
          headers,
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch station details');
        }
        
        const data = await response.json();
        console.log('Station data:', data);
        
        if (data && (data.id || data.data?.id)) {
          setStation(data.data || data);
        } else {
          throw new Error('Invalid station data format');
        }
      } catch (err) {
        console.error('Error fetching station data:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStationData();
  }, [id, router]);

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
    setSaveError('');
    setSaving(true);
    
    try {
      const headers = authHeader();
      if (!headers.Authorization) {
        setSaveError('Authentication required');
        setSaving(false);
        return;
      }
      
      const response = await apiFetch(`/stations/${id}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(station)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update station');
      }
      
      router.push(`/stations/${id}`);
    } catch (err) {
      console.error('Error updating station:', err);
      setSaveError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/stations/${id}`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Edit Station">
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          </Container>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Edit Station">
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={() => router.push('/stations')}>
              Back to Stations
            </Button>
          </Container>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Edit Station">
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
              Edit Station
            </Typography>
          </Box>
          
          {saveError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {saveError}
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
                    value={station.name || ''}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={station.address || ''}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={station.city || ''}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={station.state || ''}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zip"
                    value={station.zip || ''}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    name="contact_phone"
                    value={station.contact_phone || ''}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={station.active || false}
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
                      {saving ? 'Saving...' : 'Save Changes'}
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

export default StationEditPage;