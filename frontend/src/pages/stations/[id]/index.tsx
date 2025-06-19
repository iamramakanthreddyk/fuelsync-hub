// frontend/src/pages/stations/[id]/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalGasStation as GasIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { authHeader } from '../../../utils/authHelper';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`station-tabpanel-${index}`}
      aria-labelledby={`station-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StationDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [station, setStation] = useState(null);
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

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
        
        // Fetch station details
        const stationResponse = await fetch(`http://localhost:3001/api/stations/${id}`, {
          headers
        });
        
        if (!stationResponse.ok) {
          if (stationResponse.status === 401) {
            router.push('/login');
            return;
          }
          const errorData = await stationResponse.json();
          throw new Error(errorData.message || 'Failed to fetch station details');
        }
        
        const stationData = await stationResponse.json();
        console.log('Station data:', stationData);
        
        if (stationData && (stationData.id || stationData.data?.id)) {
          setStation(stationData.data || stationData);
          
          // Fetch pumps for this station
          const pumpsResponse = await fetch(`http://localhost:3001/api/stations/${id}/pumps`, {
            headers
          });
          
          if (pumpsResponse.ok) {
            const pumpsData = await pumpsResponse.json();
            console.log('Pumps data:', pumpsData);
            
            if (pumpsData && Array.isArray(pumpsData.data)) {
              setPumps(pumpsData.data);
            } else if (pumpsData && Array.isArray(pumpsData)) {
              setPumps(pumpsData);
            } else {
              console.warn('Invalid pumps data format:', pumpsData);
              setPumps([]);
            }
          } else {
            console.warn('Failed to fetch pumps:', await pumpsResponse.text());
            setPumps([]);
          }
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    router.push(`/stations/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this station?')) {
      return;
    }
    
    try {
      const headers = authHeader();
      const response = await fetch(`http://localhost:3001/api/stations/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        router.push('/stations');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete station: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting station:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Station Details">
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
        <DashboardLayout title="Station Details">
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

  if (!station) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Station Details">
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Alert severity="warning">Station not found</Alert>
            <Button variant="contained" onClick={() => router.push('/stations')} sx={{ mt: 2 }}>
              Back to Stations
            </Button>
          </Container>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Format address
  const formattedAddress = [
    station.address,
    station.city && station.state ? `${station.city}, ${station.state}` : (station.city || station.state),
    station.zip
  ].filter(Boolean).join(', ');

  return (
    <ProtectedRoute>
      <DashboardLayout title={station.name || "Station Details"}>
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="station management tabs">
              <Tab label="Overview" />
              <Tab label="Pumps" />
              <Tab label="Sales" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {station.name}
                  </Typography>
                  
                  {station.active !== undefined && (
                    <Chip 
                      label={station.active ? "Active" : "Inactive"} 
                      color={station.active ? "success" : "default"}
                      sx={{ mb: 2 }}
                    />
                  )}
                  
                  {formattedAddress && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {formattedAddress}
                      </Typography>
                    </Box>
                  )}
                  
                  {station.contact_phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {station.contact_phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Edit Station
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Station Summary
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Pumps" 
                        secondary={`${pumps.length} pumps available`} 
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Nozzles" 
                        secondary={`${pumps.reduce((acc, pump) => acc + (pump.nozzles?.length || 0), 0)} nozzles total`} 
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Last Updated" 
                        secondary={station.updated_at ? new Date(station.updated_at).toLocaleString() : 'N/A'} 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pumps
              </Typography>
              
              {pumps.length === 0 ? (
                <Alert severity="info">No pumps found for this station.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {pumps.map((pump) => (
                    <Grid item xs={12} sm={6} md={4} key={pump.id}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <GasIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">
                            {pump.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Serial: {pump.serial_number || 'N/A'}
                        </Typography>
                        
                        <Typography variant="body2">
                          {pump.nozzles?.length || 0} Nozzles
                        </Typography>
                        
                        {pump.active !== undefined && (
                          <Chip 
                            label={pump.active ? "Active" : "Inactive"} 
                            color={pump.active ? "success" : "default"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Recent Sales
            </Typography>
            <Alert severity="info">
              Sales data will be displayed here. This feature is coming soon.
            </Alert>
          </TabPanel>
        </Paper>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StationDetailPage;