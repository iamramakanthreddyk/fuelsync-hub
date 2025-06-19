// frontend/src/pages/sales/new/index.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { authHeader } from '../../../utils/authHelper';

const NewSalePage = () => {
  const router = useRouter();
  const [sale, setSale] = useState({
    nozzle_id: '',
    sale_volume: '',
    fuel_price: '',
    payment_method: 'cash',
    status: 'posted',
    notes: ''
  });
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [pumps, setPumps] = useState([]);
  const [nozzles, setNozzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStations = async () => {
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
        
        const response = await fetch('http://localhost:3001/api/stations', {
          headers
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch stations');
        }
        
        const data = await response.json();
        console.log('Stations data:', data);
        
        if (data && Array.isArray(data)) {
          setStations(data);
          if (data.length > 0) {
            setSelectedStation(data[0].id);
            fetchPumps(data[0].id);
          }
        } else if (data && data.data && Array.isArray(data.data)) {
          setStations(data.data);
          if (data.data.length > 0) {
            setSelectedStation(data.data[0].id);
            fetchPumps(data.data[0].id);
          }
        } else {
          throw new Error('Invalid stations data format');
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [router]);

  const fetchPumps = async (stationId) => {
    try {
      const headers = authHeader();
      const response = await fetch(`http://localhost:3001/api/stations/${stationId}/pumps`, {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pumps');
      }
      
      const data = await response.json();
      console.log('Pumps data:', data);
      
      if (data && Array.isArray(data)) {
        setPumps(data);
        if (data.length > 0) {
          fetchNozzles(data[0].id);
        } else {
          setNozzles([]);
        }
      } else if (data && data.data && Array.isArray(data.data)) {
        setPumps(data.data);
        if (data.data.length > 0) {
          fetchNozzles(data.data[0].id);
        } else {
          setNozzles([]);
        }
      } else {
        setPumps([]);
        setNozzles([]);
      }
    } catch (err) {
      console.error('Error fetching pumps:', err);
      setPumps([]);
      setNozzles([]);
    }
  };

  const fetchNozzles = async (pumpId) => {
    try {
      const headers = authHeader();
      const response = await fetch(`http://localhost:3001/api/pumps/${pumpId}/nozzles`, {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch nozzles');
      }
      
      const data = await response.json();
      console.log('Nozzles data:', data);
      
      if (data && Array.isArray(data)) {
        setNozzles(data);
        if (data.length > 0) {
          setSale(prev => ({ ...prev, nozzle_id: data[0].id }));
        }
      } else if (data && data.data && Array.isArray(data.data)) {
        setNozzles(data.data);
        if (data.data.length > 0) {
          setSale(prev => ({ ...prev, nozzle_id: data.data[0].id }));
        }
      } else {
        setNozzles([]);
      }
    } catch (err) {
      console.error('Error fetching nozzles:', err);
      setNozzles([]);
    }
  };

  const handleStationChange = (e) => {
    const stationId = e.target.value;
    setSelectedStation(stationId);
    fetchPumps(stationId);
  };

  const handlePumpChange = (e) => {
    const pumpId = e.target.value;
    fetchNozzles(pumpId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSale(prev => ({
      ...prev,
      [name]: value
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
      
      // Validate required fields
      if (!sale.nozzle_id) {
        throw new Error('Nozzle is required');
      }
      
      if (!sale.sale_volume || isNaN(parseFloat(sale.sale_volume))) {
        throw new Error('Valid sale volume is required');
      }
      
      if (!sale.fuel_price || isNaN(parseFloat(sale.fuel_price))) {
        throw new Error('Valid fuel price is required');
      }
      
      const saleData = {
        ...sale,
        sale_volume: parseFloat(sale.sale_volume),
        fuel_price: parseFloat(sale.fuel_price)
      };
      
      const response = await fetch('http://localhost:3001/api/sales', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sale');
      }
      
      const data = await response.json();
      console.log('Created sale:', data);
      
      router.push('/sales');
    } catch (err) {
      console.error('Error creating sale:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/sales');
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="New Sale">
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
              Record New Sale
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="station-select-label">Station</InputLabel>
                      <Select
                        labelId="station-select-label"
                        id="station-select"
                        value={selectedStation}
                        label="Station"
                        onChange={handleStationChange}
                      >
                        {stations.length === 0 ? (
                          <MenuItem disabled>No stations available</MenuItem>
                        ) : (
                          stations.map((station) => (
                            <MenuItem key={station.id} value={station.id}>
                              {station.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="pump-select-label">Pump</InputLabel>
                      <Select
                        labelId="pump-select-label"
                        id="pump-select"
                        value={pumps.length > 0 ? pumps[0].id : ''}
                        label="Pump"
                        onChange={handlePumpChange}
                      >
                        {pumps.length === 0 ? (
                          <MenuItem disabled>No pumps available</MenuItem>
                        ) : (
                          pumps.map((pump) => (
                            <MenuItem key={pump.id} value={pump.id}>
                              {pump.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="nozzle-select-label">Nozzle</InputLabel>
                      <Select
                        labelId="nozzle-select-label"
                        id="nozzle-select"
                        value={sale.nozzle_id}
                        label="Nozzle"
                        name="nozzle_id"
                        onChange={handleChange}
                        required
                      >
                        {nozzles.length === 0 ? (
                          <MenuItem disabled>No nozzles available</MenuItem>
                        ) : (
                          nozzles.map((nozzle) => (
                            <MenuItem key={nozzle.id} value={nozzle.id}>
                              {nozzle.fuel_type}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="payment-method-label">Payment Method</InputLabel>
                      <Select
                        labelId="payment-method-label"
                        id="payment-method"
                        value={sale.payment_method}
                        label="Payment Method"
                        name="payment_method"
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                        <MenuItem value="upi">UPI</MenuItem>
                        <MenuItem value="credit">Credit</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      label="Volume (L)"
                      name="sale_volume"
                      type="number"
                      inputProps={{ step: "0.01", min: "0" }}
                      value={sale.sale_volume}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      label="Price per Liter"
                      name="fuel_price"
                      type="number"
                      inputProps={{ step: "0.01", min: "0" }}
                      value={sale.fuel_price}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      multiline
                      rows={3}
                      value={sale.notes}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={saving || nozzles.length === 0}
                      >
                        {saving ? <CircularProgress size={24} /> : 'Record Sale'}
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
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NewSalePage;