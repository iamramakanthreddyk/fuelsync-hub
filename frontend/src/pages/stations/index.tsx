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
import { api } from '../../utils/api';
import { useRouter } from 'next/router';

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
        
        const response = await api.get('/api/stations');
        console.log('Stations response:', response);
        
        // Add defensive checks for the response format
        if (response.status === 'success' && Array.isArray(response.data)) {
          setStations(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setStations(response.data);
        } else {
          console.error('Invalid stations data format:', response);
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
  }, []);

  const handleAddStation = () => {
    router.push('/stations/new');
  };

  return (
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
  );
};

export default StationsPage;