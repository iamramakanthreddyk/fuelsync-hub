// frontend/src/pages/stations/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactPhone: string;
}

export default function Stations() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<Station[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contactPhone: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  useEffect(() => {
    // Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch stations
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStations();
  }, [router]);
  
  const handleOpenDialog = (mode: 'add' | 'edit', station?: Station) => {
    setDialogMode(mode);
    if (mode === 'edit' && station) {
      setCurrentStation(station);
      setFormData({
        name: station.name,
        address: station.address || '',
        city: station.city || '',
        state: station.state || '',
        zip: station.zip || '',
        contactPhone: station.contactPhone || ''
      });
    } else {
      setCurrentStation(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        contactPhone: ''
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      let response;
      
      if (dialogMode === 'add') {
        response = await fetch('/api/stations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`/api/stations/${currentStation?.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to save station');
      }
      
      const data = await response.json();
      
      // Update stations list
      if (dialogMode === 'add') {
        setStations(prev => [...prev, data]);
      } else {
        setStations(prev => prev.map(s => s.id === data.id ? data : s));
      }
      
      setSnackbar({
        open: true,
        message: `Station ${dialogMode === 'add' ? 'added' : 'updated'} successfully`,
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving station:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${dialogMode === 'add' ? 'add' : 'update'} station`,
        severity: 'error'
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this station?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/stations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete station');
      }
      
      // Update stations list
      setStations(prev => prev.filter(s => s.id !== id));
      
      setSnackbar({
        open: true,
        message: 'Station deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting station:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete station',
        severity: 'error'
      });
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  if (loading) {
    return (
      <DashboardLayout title="Stations">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Stations">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Your Stations</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Station
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {stations.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body1" align="center">
                  No stations found. Click the "Add Station" button to create your first station.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          stations.map(station => (
            <Grid item xs={12} sm={6} md={4} key={station.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{station.name}</Typography>
                  {station.address && (
                    <Typography variant="body2" color="textSecondary">
                      {station.address}, {station.city}, {station.state} {station.zip}
                    </Typography>
                  )}
                  {station.contactPhone && (
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Phone: {station.contactPhone}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog('edit', station)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(station.id)}
                  >
                    Delete
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => router.push(`/stations/${station.id}`)}
                  >
                    Manage
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Add/Edit Station Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Station' : 'Edit Station'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Station Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="address"
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="city"
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="state"
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="zip"
                  label="ZIP Code"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <TextField
              margin="normal"
              fullWidth
              id="contactPhone"
              label="Contact Phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Add Station' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}