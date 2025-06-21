// frontend/src/pages/stations/index.tsx
import React from 'react';
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
import StationList from '../../components/stations/StationList';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useRouter } from 'next/router';
import { useStations } from '../../hooks';

const StationsPage = () => {
  const router = useRouter();
  const { data: stations, isLoading, isError, error } = useStations();

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

          {isLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {(error as Error)?.message}
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
            <StationList stations={stations} />
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StationsPage;
