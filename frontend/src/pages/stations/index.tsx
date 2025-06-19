// frontend/src/pages/stations/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Box, 
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import StationCard from '../../components/stations/StationCard';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useRouter } from 'next/router';
import { authHeader } from '../../utils/authHelper';

const StationsPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

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
        
        console.log('Using headers:', headers);
        
        const response = await fetch('http://localhost:3001/api/stations', {
          headers
        });
        
        const data = await response.json();
        console.log('Stations data:', data);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Authentication error:', data);
            router.push('/login');
            return;
          }
          throw new Error(data.message || 'Failed to fetch stations');
        }
        
        if (data && Array.isArray(data)) {
          setStations(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setStations(data.data);
        } else {
          console.error('Invalid stations data format:', data);
          setError('Invalid data format received from server');
          setStations([]);
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError(`Error: ${err.message}`);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [router]);

  const handleAddStation = () => {
    router.push('/stations/new');
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Stations">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Stations
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddStation}
            >
              Add Station
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : !stations ? (
            <Alert severity="info">No stations available (null data)</Alert>
          ) : !Array.isArray(stations) ? (
            <Alert severity="warning">
              Invalid stations data (expected array, got {typeof stations})
            </Alert>
          ) : stations.length === 0 ? (
            <Alert severity="info">No stations found. Add your first station to get started.</Alert>
          ) : (
            <Grid container spacing={3}>
              {stations.map((station) => (
                <Grid item xs={12} sm={6} md={4} key={station.id}>
                  <StationCard station={station} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StationsPage;